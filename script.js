/*
   File: script.js
   Author: Thomas Morgan Offord
   Updated: 2026-01-07
   Description:
   Handles interactive behaviour for:
   - Services section (detail view switching)
   - Gallery lightbox (zoom, drag, pinch-to-zoom)
   Designed for desktop and mobile accessibility.
*/

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
       SERVICES SECTION LOGIC
       ========================================================== */

    /*
       Service data mapped by data-service attribute.
       Allows easy expansion without touching HTML structure.
    */
    const services = {
        reduction: {
            title: "Reduction / Pruning",
            image: "images/tree1.jpg",
            description: "Careful pruning and crown reduction to maintain tree health, safety, and appearance."
        },
        removal: {
            title: "Tree Removals",
            image: "images/removal.jpg",
            description: "Safe and controlled removal of trees, including difficult or restricted-access locations."
        },
        lifting: {
            title: "Crown Lifting",
            image: "images/lift.jpg",
            description: "Raising the canopy to improve access, light, and clearance around property."
        },
        hedges: {
            title: "Hedge Trimming",
            image: "images/hedge.jpg",
            description: "Regular and one-off hedge maintenance to keep gardens tidy and healthy."
        },
        clearance: {
            title: "Garden Clearance",
            image: "images/clearance.jpg",
            description: "Full garden and site clearance, including green waste removal."
        }
    };

    /* Cache frequently used DOM elements */
    const grid = document.getElementById("servicesGrid");
    const detail = document.getElementById("serviceDetail");
    const detailTitle = document.getElementById("detailTitle");
    const detailDescription = document.getElementById("detailDescription");
    const detailImage = document.getElementById("detailImage");

    /*
       When a service panel is clicked:
       - Populate the detail view
       - Hide the grid
       - Show the detail section
    */
    document.querySelectorAll(".service-panel").forEach(panel => {
        panel.addEventListener("click", () => {
            const service = services[panel.dataset.service];

            detailTitle.textContent = service.title;
            detailDescription.textContent = service.description;
            detailImage.src = service.image;
            detailImage.alt = service.title;

            grid.style.display = "none";
            detail.classList.remove("hidden");
            detail.setAttribute("aria-hidden", "false");

            panel.setAttribute("aria-expanded", "true");
        });
    });

    /* Return to services grid */
    document.getElementById("backToServices").addEventListener("click", () => {
        detail.classList.add("hidden");
        grid.style.display = "grid";
        detail.setAttribute("aria-hidden", "true");
    });

    /* ==========================================================
       GALLERY LIGHTBOX LOGIC
       ========================================================== */

    /* Cache gallery and lightbox elements */
    const galleryImages = document.querySelectorAll(".gallery img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    /* Fail safely if lightbox elements are missing */
    if (!lightbox || !lightboxImg) return;

    /* Detect touch-capable devices */
    const isMobile = 'ontouchstart' in window;

    /* ==========================================================
       LIGHTBOX STATE VARIABLES
       ========================================================== */
    let isDragging = false;
    let startX, startY;
    let currentX = 0, currentY = 0;
    let zoomed = false;
    let wasDragging = false;

    /* Mobile pinch-zoom state */
    let pinchZooming = false;
    let initialDistance = 0;
    let initialScale = 2;

    /* ==========================================================
       OPEN LIGHTBOX
       ========================================================== */
    galleryImages.forEach(img => {
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.remove("hidden");

            /* Reset transform and interaction state */
            currentX = 0;
            currentY = 0;
            zoomed = false;
            wasDragging = false;
            pinchZooming = false;
            initialDistance = 0;

            lightboxImg.style.transform = "";
            lightboxImg.style.cursor = isMobile ? "default" : "zoom-in";
        });
    });

    /* Close lightbox when clicking outside the image */
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    /* ==========================================================
       DESKTOP CLICK-TO-ZOOM
       ========================================================== */
    if (!isMobile) {
        lightboxImg.addEventListener("click", (e) => {
            e.stopPropagation();

            /* Prevent accidental zoom after dragging */
            if (wasDragging) {
                wasDragging = false;
                return;
            }

            /* Calculate click position for transform-origin */
            const rect = lightboxImg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            lightboxImg.style.transformOrigin = `${x}% ${y}%`;

            zoomed = !zoomed;
            currentX = 0;
            currentY = 0;

            lightboxImg.style.transform = zoomed
                ? `translate(0px, 0px) scale(2)`
                : `translate(0px, 0px) scale(1)`;

            lightboxImg.style.cursor = zoomed ? "grab" : "zoom-in";
        });
    }

    /* ==========================================================
       DRAGGING LOGIC (DESKTOP & MOBILE)
       ========================================================== */

    function startDrag(e) {
        if (!zoomed || pinchZooming) return;

        e.preventDefault();

        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;

        isDragging = true;
        startX = clientX - currentX;
        startY = clientY - currentY;

        lightboxImg.classList.add("dragging");
    }

    function onDrag(e) {
        if (!isDragging) return;

        wasDragging = true;

        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;

        currentX = clientX - startX;
        currentY = clientY - startY;

        lightboxImg.style.transform =
            `translate(${currentX}px, ${currentY}px) scale(${zoomed ? 2 : 1})`;
    }

    function endDrag() {
        if (!isDragging) return;

        isDragging = false;
        lightboxImg.classList.remove("dragging");
        lightboxImg.style.cursor =
            zoomed && !isMobile ? "grab" : (isMobile ? "default" : "zoom-in");
    }

    /* Mouse drag events */
    lightboxImg.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);

    /* Touch drag events */
    lightboxImg.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", endDrag);

    /* ==========================================================
       PINCH-TO-ZOOM (MOBILE ONLY)
       ========================================================== */

    function getDistance(touches) {
        const [t1, t2] = touches;
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        return Math.hypot(dx, dy);
    }

    if (isMobile) {
        lightboxImg.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
                pinchZooming = true;
                e.preventDefault();

                initialDistance = getDistance(e.touches);

                /* Extract existing scale if present */
                const match = lightboxImg.style.transform.match(/scale\(([\d.]+)\)/);
                initialScale = match ? parseFloat(match[1]) : 2;
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchmove", (e) => {
            if (!pinchZooming || e.touches.length !== 2) return;

            e.preventDefault();

            const currentDistance = getDistance(e.touches);
            let scale = (currentDistance / initialDistance) * initialScale;

            /* Clamp zoom level */
            scale = Math.max(1, Math.min(scale, 4));

            lightboxImg.style.transform =
                `translate(${currentX}px, ${currentY}px) scale(${scale})`;

            zoomed = scale > 1;
            lightboxImg.style.cursor = "default";
        }, { passive: false });

        lightboxImg.addEventListener("touchend", (e) => {
            if (e.touches.length < 2) pinchZooming = false;
        });
    }

    /* ==========================================================
       CLOSE LIGHTBOX
       ========================================================== */

    /* ESC key closes lightbox */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.add("hidden");
        lightboxImg.src = "";

        /* Reset all state */
        zoomed = false;
        currentX = 0;
        currentY = 0;
        wasDragging = false;
        pinchZooming = false;
        initialDistance = 0;

        lightboxImg.style.transform = "";
        lightboxImg.style.cursor = isMobile ? "default" : "zoom-in";
    }
});
