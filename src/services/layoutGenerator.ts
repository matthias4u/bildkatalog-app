import { Settings, ImageFile, PageLayout, LayoutRect, LayoutMode, VariationLevel, BspRect } from '../types';

export function generateGridLayout(files: ImageFile[], settings: Settings): PageLayout[] {
  const pages: PageLayout[] = [];
  let fileIndex = 0;

  while (fileIndex < files.length) {
    const contentW = settings.pageW - settings.mIn - settings.mOut;
    const contentH = settings.pageH - settings.mTop - settings.mBot;

    const { gridCols: cols, gridRows: rows, gridGap: gap } = settings;
    const tileW = (contentW - (cols - 1) * gap) / cols;
    const tileH = (contentH - (rows - 1) * gap) / rows;

    const pageLayout: LayoutRect[] = [];
    const imagesOnPage = cols * rows;

    for (let i = 0; i < imagesOnPage && fileIndex < files.length; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;

      const x = settings.mIn + c * (tileW + gap);
      const y = settings.mTop + r * (tileH + gap);
      
      pageLayout.push({
        x,
        y,
        width: tileW,
        height: tileH,
        image: files[fileIndex],
      });
      fileIndex++;
    }
    
    pages.push({
      width: settings.pageW,
      height: settings.pageH,
      layout: pageLayout,
    });
  }

  return pages;
}

/**
 * Runs a Binary Space Partitioning algorithm on a given rectangular area to divide it
 * into a target number of smaller rectangles.
 * @param bounds The rectangle (in grid coordinates) to subdivide.
 * @param targetTiles The desired number of rectangles to create.
 * @param rnd A factor for randomness in splitting (0 to 0.5).
 * @param R The total number of rows in the page grid (for anti-striping logic).
 * @param C The total number of columns in the page grid (for anti-striping logic).
 * @returns An array of BspRects with absolute page grid coordinates.
 */
function runBspOnRect(bounds: BspRect, targetTiles: number, rnd: number, R: number, C: number): BspRect[] {
    if (targetTiles <= 0) return [];
    if (targetTiles === 1) return [bounds];

    let rects: BspRect[] = [{ r: 0, c: 0, w: bounds.w, h: bounds.h }]; // Start with relative coordinates

    const splitRect = (rc: BspRect): boolean => {
        let vert = (Math.random() < 0.5);
        if (rc.w > rc.h) vert = true; else if (rc.h > rc.w) vert = false;

        if (vert) {
            if (rc.w < 2) return false;
            const mid = Math.round(rc.w * (0.5 + (Math.random() - 0.5) * rnd));
            let cut = Math.max(1, Math.min(rc.w - 1, mid));

            if (cut === 1 && rc.h > Math.ceil(bounds.h * 0.6)) cut = 2;
            if (rc.w - cut === 1 && rc.h > Math.ceil(bounds.h * 0.6)) cut = Math.max(2, cut - 1);
            if (cut >= rc.w) cut = rc.w - 1;
            if (cut < 1) return false;

            rects.push({ r: rc.r, c: rc.c, h: rc.h, w: cut }, { r: rc.r, c: rc.c + cut, h: rc.h, w: rc.w - cut });
            return true;
        } else {
            if (rc.h < 2) return false;
            const mid2 = Math.round(rc.h * (0.5 + (Math.random() - 0.5) * rnd));
            let cut2 = Math.max(1, Math.min(rc.h - 1, mid2));

            if (cut2 === 1 && rc.w > Math.ceil(bounds.w * 0.6)) cut2 = 2;
            if (rc.h - cut2 === 1 && rc.w > Math.ceil(bounds.w * 0.6)) cut2 = Math.max(2, cut2 - 1);
            if (cut2 >= rc.h) cut2 = rc.h - 1;
            if (cut2 < 1) return false;

            rects.push({ r: rc.r, c: rc.c, h: cut2, w: rc.w }, { r: rc.r + cut2, c: rc.c, h: rc.h - cut2, w: rc.w });
            return true;
        }
    };

    let guard = 0;
    while (rects.length < targetTiles && guard < 500) {
        let bi = -1, ba = -1;
        rects.forEach((r, i) => { const a = r.h * r.w; if (a > ba) { ba = a; bi = i; } });

        if (bi < 0) break;
        const rc = rects.splice(bi, 1)[0];
        if (!splitRect(rc)) {
            rects.push(rc); break;
        }
        guard++;
    }

    while (rects.length > targetTiles) {
        rects.sort((a, b) => (a.h * a.w) - (b.h * b.w));
        const pick = rects.shift();
        if (!pick) break;
        
        let merged = false;
        for (let i = 0; i < rects.length; i++) {
            const r2 = rects[i];
            if (pick.r === r2.r && pick.h === r2.h && (pick.c + pick.w === r2.c || r2.c + r2.w === pick.c)) {
                rects.splice(i, 1); rects.push({ r: pick.r, c: Math.min(pick.c, r2.c), h: pick.h, w: pick.w + r2.w }); merged = true; break;
            }
            if (pick.c === r2.c && pick.w === r2.w && (pick.r + pick.h === r2.r || r2.r + r2.h === pick.r)) {
                rects.splice(i, 1); rects.push({ r: Math.min(pick.r, r2.r), c: pick.c, h: pick.h + r2.h, w: pick.w }); merged = true; break;
            }
        }
        if (!merged) { rects.push(pick); break; }
    }
    
    // Translate relative coordinates to absolute page grid coordinates
    return rects.map(r => ({ ...r, r: r.r + bounds.r, c: r.c + bounds.c }));
}

export function generateClusterLayout(files: ImageFile[], settings: Settings): PageLayout[] {
    const pages: PageLayout[] = [];
    let idx = 0;

    const level = settings.varLevel;
    const rnd = (level === VariationLevel.NIEDRIG) ? 0.12 : (level === VariationLevel.HOCH) ? 0.42 : 0.27;

    while (idx < files.length) {
        const ca = {
            x: settings.mIn,
            y: settings.mTop,
            w: settings.pageW - settings.mIn - settings.mOut,
            h: settings.pageH - settings.mTop - settings.mBot
        };
        const C = Math.max(1, settings.cCols);
        const R = Math.max(1, settings.cRows);
        const GAP = settings.cGap;

        const colW = (ca.w - (C - 1) * GAP) / C;
        const rowH = (ca.h - (R - 1) * GAP) / R;

        const left = files.length - idx;
        const target = settings.target ? settings.target : Math.max(Math.round((C * R) / 6), 6);
        let K = Math.min(left, target + 2);
        if (K < 1) K = left;
        if(K > (C * R)) K = C * R;

        const filesForPage = files.slice(idx, idx + K);
        let allRectsOnPage: BspRect[] = [];

        if (settings.heroMode && filesForPage.length > 1) {
            const heroW = Math.max(1, Math.round(C * 0.65));
            const heroH = Math.max(1, Math.round(R * 0.65));

            const heroRect: BspRect = { r: 0, c: 0, w: heroW, h: heroH };
            allRectsOnPage.push(heroRect);
            
            const rectsToSubdivide: BspRect[] = [];
            const rectRight: BspRect = { r: 0, c: heroW, w: C - heroW, h: R };
            const rectBelow: BspRect = { r: heroH, c: 0, w: heroW, h: R - heroH };
            
            if (rectRight.w > 0 && rectRight.h > 0) rectsToSubdivide.push(rectRight);
            if (rectBelow.w > 0 && rectBelow.h > 0) rectsToSubdivide.push(rectBelow);

            const imagesForSubdivision = filesForPage.length - 1;
            const totalSubdivisionArea = rectsToSubdivide.reduce((acc, r) => acc + (r.w * r.h), 0);
            
            let imagesAssigned = 0;
            rectsToSubdivide.forEach((subRect, i) => {
                if (totalSubdivisionArea === 0) return;
                const proportion = (subRect.w * subRect.h) / totalSubdivisionArea;
                const numImages = (i === rectsToSubdivide.length - 1) 
                    ? imagesForSubdivision - imagesAssigned
                    : Math.max(1, Math.round(proportion * imagesForSubdivision));
                
                if (numImages > 0) {
                   const subdivided = runBspOnRect(subRect, numImages, rnd, R, C);
                   allRectsOnPage.push(...subdivided);
                   imagesAssigned += numImages;
                }
            });

        } else {
             allRectsOnPage = runBspOnRect({ r: 0, c: 0, w: C, h: R }, filesForPage.length, rnd, R, C);
        }

        allRectsOnPage.sort((a, b) => (a.r !== b.r) ? a.r - b.r : a.c - b.c);

        const pageLayout: LayoutRect[] = [];
        for (let i = 0; i < allRectsOnPage.length && idx < files.length; i++, idx++) {
            const p = allRectsOnPage[i];
            const x1 = ca.x + p.c * (colW + GAP);
            const y1 = ca.y + p.r * (rowH + GAP);
            const w = p.w * colW + (p.w - 1) * GAP;
            const h = p.h * rowH + (p.h - 1) * GAP;
            
            pageLayout.push({
                x: x1,
                y: y1,
                width: w,
                height: h,
                image: files[idx],
            });
        }
        
        pages.push({
            width: settings.pageW,
            height: settings.pageH,
            layout: pageLayout,
        });
    }

    return pages;
}
