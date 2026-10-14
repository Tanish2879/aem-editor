import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the showcase block
 * @param {Element} block The showcase block element
 */
export default function decorate(block) {
  const slides = [];
  const rows = [...block.children];

  // Process rows/items
  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.className = 'showcase-slide';
    moveInstrumentation(row, slide);

    const cols = [...row.children];
    let imgCol;
    let contentCol;

    if (cols.length >= 2) {
      [imgCol, contentCol] = cols;
    } else if (cols.length === 1) {
      const [singleCol] = cols;
      const picture = singleCol.querySelector('picture') || singleCol.querySelector('img');
      if (picture) {
        imgCol = singleCol;
      } else {
        contentCol = singleCol;
      }
    }

    // Media container
    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'showcase-media';

    if (imgCol) {
      const picture = imgCol.querySelector('picture');
      const img = imgCol.querySelector('img');
      if (img) {
        const optimizedPic = createOptimizedPicture(img.src, img.alt || 'Showcase image', false, [
          { media: '(min-width: 900px)', width: '1200' },
          { width: '750' },
        ]);
        moveInstrumentation(img, optimizedPic.querySelector('img'));
        mediaWrapper.append(optimizedPic);
      } else if (picture) {
        mediaWrapper.append(picture);
      }
    }

    // Content container with corner brackets frame
    const frame = document.createElement('div');
    frame.className = 'showcase-content-frame';

    // Add 4 technical corner markers: top-left, top-right, bottom-left, bottom-right
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach((pos) => {
      const corner = document.createElement('span');
      corner.className = `showcase-corner showcase-corner-${pos}`;
      corner.setAttribute('aria-hidden', 'true');
      frame.append(corner);
    });

    const body = document.createElement('div');
    body.className = 'showcase-body';

    if (contentCol) {
      moveInstrumentation(contentCol, body);
      while (contentCol.firstElementChild) {
        body.append(contentCol.firstElementChild);
      }

      // Classify elements within the body for precise styling
      const headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((h) => h.classList.add('showcase-heading'));

      const paragraphs = [...body.querySelectorAll('p')];
      paragraphs.forEach((p, idx) => {
        const link = p.querySelector('a');

        // Check if paragraph is an eyebrow (comes before the first heading, short text, uppercase)
        if (headings.length > 0 && idx === 0 && !p.querySelector('picture') && !link) {
          p.classList.add('showcase-eyebrow');
        } else if (!p.classList.contains('button-wrapper')) {
          p.classList.add('showcase-description');
        }
      });
    }

    frame.append(body);
    slide.append(mediaWrapper, frame);
    slides.push(slide);
  });

  // Build pagination indicator / stepper (as seen on the left in the design)
  const pagination = document.createElement('div');
  pagination.className = 'showcase-pagination';
  pagination.setAttribute('role', 'tablist');
  pagination.setAttribute('aria-label', 'Showcase Navigation');

  const totalIndicators = Math.max(slides.length, 5);
  for (let i = 0; i < totalIndicators; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `showcase-indicator${i === 0 ? ' active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `Slide ${i + 1}`);

    btn.addEventListener('click', () => {
      pagination.querySelectorAll('.showcase-indicator').forEach((ind, idx) => {
        const isActive = idx === i;
        ind.classList.toggle('active', isActive);
        ind.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // If slide exists for this index, switch to it
      if (slides[i]) {
        slides.forEach((s, idx) => {
          s.classList.toggle('active', idx === i);
        });
      }
    });

    pagination.append(btn);
  }

  // Set first slide active
  if (slides.length > 0) {
    slides[0].classList.add('active');
  }

  // Assembly
  const container = document.createElement('div');
  container.className = 'showcase-inner';
  container.append(pagination);

  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'showcase-slides';
  slides.forEach((slide) => slidesContainer.append(slide));
  container.append(slidesContainer);

  block.replaceChildren(container);
}
