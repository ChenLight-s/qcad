/**
 * Simple API, mainly designed for use in the ECMAScript console.
 */

include("scripts/library.js");
include("scripts/input.js");

// internal:
__simpleUseOp = false;
__simpleOp = undefined;

/**
 * Returns a pointer to the main application window (RMainWindowQt).
 */
function getMainWindow() {
    return RMainWindowQt.getMainWindow();
}

/**
 * Returns the current RDocumentInterface or undefined.
 */
function getDocumentInterface() {
    var appWin = getMainWindow();
    return appWin.getDocumentInterface();
}

/**
 * Returns the current RDocument or undefined.
 */
function getDocument() {
    var di = getDocumentInterface();
    if (isNull(di)) {
        return undefined;
    }
    return di.getDocument();
}

/**
 * Adds a point to the drawing.
 *
 * \code
 * addPoint(x,y)
 * addPoint(new RVector(x,y))
 * \endcode
 */
function addPoint(p1, p2) {
    if (isNumber(p1)) {
        addPoint(new RVector(p1, p2));
        return;
    }

    addShape(new RPoint(p1));
}

/**
 * Adds a line to the drawing.
 *
 * \code
 * addLine(x1,y1, x2,y2)
 * addLine(new RVector(x1,y1), new RVector(x2,y2))
 * \endcode
 */
function addLine(p1, p2, p3, p4) {
    if (isNumber(p1)) {
        addLine(new RVector(p1, p2), new RVector(p3, p4));
        return;
    }

    addShape(new RLine(p1, p2));
}

/**
 * Adds an arc to the drawing.
 *
 * \code
 * addArc(cx,cy, radius, startAngle, endAngle, reversed)
 * addArc(new RVector(cx,cy), radius, startAngle, endAngle, reversed)
 * \endcode
 */
function addArc(p1, p2, p3, p4, p5, p6) {
    if (isNumber(p1)) {
        addArc(new RVector(p1, p2), p3, p4, p5, p6);
        return;
    }
    addShape(new RArc(p1, p2, p3, p4, p5));
}

/**
 * Adds a circle to the drawing.
 *
 * \code
 * addCircle(cx,cy, radius)
 * addCircle(new RVector(cx,cy), radius)
 * \endcode
 */
function addCircle(p1, p2, p3) {
    if (isNumber(p1)) {
        addCircle(new RVector(p1, p2), p3);
        return;
    }
    addShape(new RCircle(p1, p2));
}

/**
 * Adds a polyline to the drawing.
 *
 * \param points Array of RVector or [x,y] tuples.
 * \param closed True for an implicitely closed polyline.
 *
 * \code
 * addPolyline([[x1,y1],[x2,y2],[x3,y3]], false)
 * addPolyline([new RVector(x1,y1)],new RVector(x2,y2),new RVector(x3,y3)], false)
 * \endcode
 */
function addPolyline(points, closed) {
    if (isNull(closed)) {
        closed = false;
    }
    var pl = new RPolyline();
    pl.setClosed(closed);
    for (var i=0; i<points.length; i++) {
        if (isVector(points[i])) {
            pl.appendVertex(points[i]);
        }
        else {
            pl.appendVertex(new RVector(points[i][0], points[i][1]));
        }
    }
    addShape(pl);
}

/**
 * Adds a simple text to the drawing.
 *
 * \param text Text string.
 * \param x X position
 * \param y Y position
 * \param height Text height (defaults to 1)
 * \param angle Text angle (defaults to 0)
 * \param font Font (defaults to "standard")
 * \param vAlign Vertical alignment (defaults to RS.VAlignTop)
 * \param hAlign Horizontal alignment (defaults to RS.HAlignLeft)
 * \param bold True for bold text (TTF fonts only)
 * \param italic True for italic text (TTF fonts only)
 *
 * \code
 * addPolyline([[x1,y1],[x2,y2],[x3,y3]], false)
 * addPolyline([new RVector(x1,y1)],new RVector(x2,y2),new RVector(x3,y3)], false)
 * \endcode
 */
function addSimpleText(text, x, y, height, angle, font, vAlign, hAlign, bold, italic) {
    if (isNull(height)) height = 1.0;
    if (isNull(angle)) angle = 0.0;
    if (isNull(font)) font = "Standard";
    if (isNull(vAlign)) vAlign = RS.VAlignTop;
    if (isNull(hAlign)) hAlign = RS.HAlignLeft;
    if (isNull(bold)) bold = false;
    if (isNull(italic)) italic = false;

    var entity = new RTextEntity(
        getDocument(),
        new RTextData(
              new RVector(x, y),
              new RVector(x, y),
              height,
              100.0,
              vAlign,
              hAlign,
              RS.LeftToRight,
              RS.Exact,
              1.0,
              text,
              font,
              bold,
              italic,
              angle,
              true
        )
    );
    addEntity(entity);
}

/**
 * Adds the given RShape to the drawing using current layer and attributes.
 */
function addShape(shape) {
    var di = getDocumentInterface();
    var entity = shapeToEntity(getDocument(), shape);
    addEntity(entity);
}

/**
 * Adds the given REntity to the drawing using layer and attributes as set by the entity.
 */
function addEntity(entity) {
    if (__simpleUseOp===true) {
        if (isNull(__simpleOp)) {
            __simpleOp = new RAddObjectsOperation();
        }
        __simpleOp.addObject(entity, false);
    }
    else {
        var di = getDocumentInterface();
        di.applyOperation(new RAddObjectOperation(entity, false));
    }
}

/**
 * Starts a transaction. This can increase performance when adding multiple entities.
 * Entities are added in one transaction when endTransaction is called.
 *
 * \code
 * startTransaction();
 * for (...) {
 *     addLine(...);
 * }
 * endTransaction();
 * \endcode
 */
function startTransaction() {
    __simpleUseOp = true;
    if (!isNull(__simpleOp)) {
        __simpleOp.destroy();
        __simpleOp = undefined;
    }
}

/**
 * \see startTransaction
 */
function endTransaction() {
    if (!isNull(__simpleOp)) {
        var di = getDocumentInterface();
        di.applyOperation(__simpleOp);
        __simpleOp = undefined;
    }
    __simpleUseOp = false;
}
