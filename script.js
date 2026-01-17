/*
 * File: script.js
 * Project: Morgan Tree Services
 * Author: Thomas Morgan Offord
 * Last updated: 2026-01-17
 * Purpose: UI interactivity for Services panels and Gallery lightbox.
 */
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       Services — expand/collapse panels
       ========================= */
    const services = {
        reduction: {
            title: "Reduction / Pruning",
            description: "Careful pruning and crown reduction to maintain safety, and appearance."
        },
        removal: {
            title: "Tree Felling / Removal",
            description: "Safe and controlled removal of trees, including difficult or restricted-access locations."
        },
        lifting: {
            title: "Crown Lifting",
            description: "Raising the canopy to improve light and clearance or to allow access."
        },
        hedges: {
            title: "Hedge Trimming",
            description: "Regular and one-off hedge maintenance for shape and aesthetic appeal."
        },
        clearance: {
            title: "Garden Clearance",
            description: "Full garden and site clearance, including green waste removal."
        },
        carving: {
            title: "Bespoke Wood Carving",
            description: "When the sad decision is made to remove your tree, why not leave behind a tree spirit to continue it's legacy?\n Talk to us about bespoke carving."
        }
    };

    const panels = document.querySelectorAll(".service-panel-wrapper");

    panels.forEach(panelWrapper => {
        const panel = panelWrapper.querySelector(".service-panel");
        panel.addEventListener("click", () => {
            const isExpanded = panelWrapper.classList.contains("expanded");

            // Collapse all panels
            panels.forEach(pw => {
                if (pw.classList.contains("expanded")) {
                    const textDiv = pw.querySelector(".service-text");
                    if (textDiv) textDiv.remove();
                    pw.classList.remove("expanded");
                    pw.querySelector(".service-panel").setAttribute("aria-expanded", "false");
                }
            });

            if (!isExpanded) {
                // Expand clicked panel
                panelWrapper.classList.add("expanded");
                const service = services[panel.dataset.service];

                // Create text element
                const detailDiv = document.createElement("div");
                detailDiv.classList.add("service-text");
                detailDiv.innerHTML = `<h3>${service.title}</h3>
<p>${service.description}</p>`;
                panelWrapper.appendChild(detailDiv);
                panel.setAttribute("aria-expanded", "true");

                // Scroll expanded panel to top of viewport smoothly
                panelWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                // If collapsing, scroll back to top of this panel
                const headerOffset = 20; // optional padding above panel
                const panelTop = panelWrapper.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top: panelTop, behavior: "smooth" });
            }
        });
    });

    // Reset image heights on window resize if not expanded
    window.addEventListener("resize", () => {
        panels.forEach(pw => {
            if (!pw.classList.contains("expanded")) {
                const img = pw.querySelector("img");
                img.style.height = "";
            }
        });
    });

    /* =========================
       GALLERY LIGHTBOX
       ========================= */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");
    const lightboxClose = document.querySelector(".lightbox-close");

    if (!lightbox || !lightboxImg) return;

    const isMobile = 'ontouchstart' in window;

    // State
    let isDragging = false;
    let startX, startY;
    let currentX = 0, currentY = 0;
    let zoomed = false;
    let wasDragging = false;
    let pinchZooming = false;
    let initialDistance = 0;
    let initialScale = 2;

    // Navigation state
    let currentSetImages = [];
    let currentImageIndex = 0;

    /* ---------- OPEN LIGHTBOX (ONLY FROM SET IMAGES) ---------- */
    document.addEventListener("click", (e) => {
        const img = e.target.closest(".gallery-set-images img");
        if (!img) return;
        e.preventDefault();
        e.stopPropagation();

        // Find all images in the current set
        const setContainer = img.closest(".gallery-set-content");
        currentSetImages = Array.from(setContainer.querySelectorAll(".gallery-set-images img"));
        currentImageIndex = currentSetImages.indexOf(img);

        // Update lightbox with current image
        updateLightboxImage();
        lightbox.classList.remove("hidden");
        currentX = 0;
        currentY = 0;
        zoomed = false;
        wasDragging = false;
        pinchZooming = false;
        lightboxImg.style.transform = "";
        lightboxImg.style.cursor = isMobile ? "default" : "zoom-in";

        // Update button visibility
        updateNavigationButtons();
    });

    /* ---------- CLOSE LIGHTBOX ---------- */
    function closeLightbox() {
        lightbox.classList.add("hidden");
        lightboxImg.src = "";
        zoomed = false;
        currentX = 0;
        currentY = 0;
        wasDragging = false;
        pinchZooming = false;
        initialDistance = 0;
        lightboxImg.style.transform = "";
        currentSetImages = [];
        currentImageIndex = 0;
    }

    /* ---------- NAVIGATION FUNCTIONS ---------- */
    function updateLightboxImage() {
        if (currentSetImages.length === 0 || currentImageIndex < 0 || currentImageIndex >= currentSetImages.length) return;
        const img = currentSetImages[currentImageIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }

    function updateNavigationButtons() {
        if (lightboxPrev && lightboxNext) {
            lightboxPrev.style.display = currentSetImages.length > 1 ? "flex" : "none";
            lightboxNext.style.display = currentSetImages.length > 1 ? "flex" : "none";
        }
    }

    function showPrevImage() {
        if (currentSetImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + currentSetImages.length) % currentSetImages.length;
        updateLightboxImage();
        resetZoomAndPosition();
    }

    function showNextImage() {
        if (currentSetImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % currentSetImages.length;
        updateLightboxImage();
        resetZoomAndPosition();
    }

    function resetZoomAndPosition() {
        zoomed = false;
        currentX = 0;
        currentY = 0;
        lightboxImg.style.transform = "";
        lightboxImg.style.cursor = isMobile ? "default" : "zoom-in";
    }

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showPrevImage();
        if (e.key === "ArrowRight") showNextImage();
    });

    /* ---------- BUTTON EVENT LISTENERS ---------- */
    if (lightboxPrev) lightboxPrev.addEventListener("click", (e) => { e.stopPropagation(); showPrevImage(); });
    if (lightboxNext) lightboxNext.addEventListener("click", (e) => { e.stopPropagation(); showNextImage(); });
    if (lightboxClose) lightboxClose.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });

    /* ---------- DESKTOP CLICK ZOOM ---------- */
    if (!isMobile) {
        lightboxImg.addEventListener("click", (e) => {
            e.stopPropagation();
            if (wasDragging) { wasDragging = false; return; }
            const rect = lightboxImg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            lightboxImg.style.transformOrigin = `${x}% ${y}%`;
            zoomed = !zoomed;
            currentX = 0;
            currentY = 0;
            lightboxImg.style.transform = zoomed ? `translate(0, 0) scale(2)` : `translate(0, 0) scale(1)`;
            lightboxImg.style.cursor = zoomed ? "grab" : "zoom-in";
        });
    }

    /* ---------- DRAGGING ---------- */
    function startDrag(e) {
        if (!zoomed || pinchZooming) return;
        e.preventDefault();
        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;
        isDragging = true;
        startX = clientX - currentX;
        startY = clientY - currentY;
    }

    function onDrag(e) {
        if (!isDragging) return;
        wasDragging = true;
        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;
        currentX = clientX - startX;
        currentY = clientY - startY;
        lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomed ? 2 : 1})`;
    }

    function endDrag() { isDragging = false; }

    lightboxImg.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
    lightboxImg.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", endDrag);

    /* ---------- PINCH ZOOM (MOBILE) ---------- */
    function getDistance(touches) {
        const [t1, t2] = touches;
        return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }

    if (isMobile) {
        lightboxImg.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
                pinchZooming = true;
                initialDistance = getDistance(e.touches);
                initialScale = zoomed ? 2 : 1;
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchmove", (e) => {
            if (!pinchZooming || e.touches.length !== 2) return;
            e.preventDefault();
            const scale = Math.max(1, Math.min((getDistance(e.touches) / initialDistance) * initialScale, 4));
            zoomed = scale > 1;
            lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
        }, { passive: false });

        lightboxImg.addEventListener("touchend", () => { pinchZooming = false; });
    }

    /* =========================
       GALLERY SET TOGGLE (NO LIGHTBOX INTERFERENCE)
       ========================= */
    document.querySelectorAll(".gallery-set-card").forEach(card => {
        card.addEventListener("click", (e) => {
            e.stopPropagation(); // 🔑 prevent lightbox
            const id = card.dataset.set;
            const content = document.getElementById(id);
            document.querySelectorAll(".gallery-set-card").forEach(c => c.style.display = "none");
            document.querySelectorAll(".gallery-set-content").forEach(c => c.classList.remove("active"));
            content.classList.add("active");
            content.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    document.querySelectorAll(".gallery-set-back").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".gallery-set-content").forEach(c => c.classList.remove("active"));
            document.querySelectorAll(".gallery-set-card").forEach(c => c.style.display = "");
            document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

});
