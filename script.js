/*
 * File: script.js
 * Project: Morgan Tree Services
 * Author: Thomas Morgan Offord
 * Last updated: 2026-01-09
 * Purpose: UI interactivity for Services panels and Gallery lightbox.
 */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
         Services — expand/collapse panels
         ========================= */
    const services = {
        reduction: {
            title: "Reduction / Pruning",
            description: "Careful pruning and crown reduction to maintain tree health, safety, and appearance."
        },
        removal: {
            title: "Tree Removals",
            description: "Safe and controlled removal of trees, including difficult or restricted-access locations."
        },
        lifting: {
            title: "Crown Lifting",
            description: "Raising the canopy to improve access, light, and clearance around property."
        },
        hedges: {
            title: "Hedge Trimming",
            description: "Regular and one-off hedge maintenance to keep gardens tidy and healthy."
        },
        clearance: {
            title: "Garden Clearance",
            description: "Full garden and site clearance, including green waste removal."
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
                detailDiv.innerHTML = `
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                `;
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
        Gallery lightbox — click to open; zoom/pan (desktop) and pinch-to-zoom (mobile)
        ========================= */
    const galleryImages = document.querySelectorAll(".gallery img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    if (!lightbox || !lightboxImg) return;

    // Detect if mobile
    const isMobile = 'ontouchstart' in window;

    // State variables
    let isDragging = false;
    let startX, startY;
    let currentX = 0, currentY = 0;
    let zoomed = false;
    let wasDragging = false;
    let pinchZooming = false;
    let initialDistance = 0;
    let initialScale = 2;

    // ---------- OPEN LIGHTBOX ----------
    galleryImages.forEach(img => {
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.remove("hidden");

            // Reset all states
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

    // Click outside image closes lightbox
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ---------- DESKTOP: Click to zoom ----------
    if (!isMobile) {
        lightboxImg.addEventListener("click", (e) => {
            e.stopPropagation();
            if (wasDragging) {
                wasDragging = false;
                return;
            }

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

    // ---------- DRAGGING ----------
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
        lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomed ? 2 : 1})`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        lightboxImg.classList.remove("dragging");
        lightboxImg.style.cursor = zoomed && !isMobile ? "grab" : (isMobile ? "default" : "zoom-in");
    }

    // Mouse events
    lightboxImg.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);

    // Touch drag events
    lightboxImg.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", endDrag);

    // ---------- PINCH ZOOM (MOBILE ONLY) ----------
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
                const match = lightboxImg.style.transform.match(/scale\(([\d.]+)\)/);
                initialScale = match ? parseFloat(match[1]) : 2;
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchmove", (e) => {
            if (!pinchZooming || e.touches.length !== 2) return;
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            let scale = (currentDistance / initialDistance) * initialScale;
            scale = Math.max(1, Math.min(scale, 4)); // clamp zoom
            lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
            zoomed = scale > 1;
            lightboxImg.style.cursor = "default";
        }, { passive: false });

        lightboxImg.addEventListener("touchend", (e) => {
            if (e.touches.length < 2) pinchZooming = false;
        });
    }

    // ---------- CLOSE LIGHTBOX ----------
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });

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
        lightboxImg.style.cursor = isMobile ? "default" : "zoom-in";
    }
});
