/**
 * IREN Website Orchestration Script
 * Zero-build, client-side YAML & Markdown rendering with modern interactive features
 */

const content_dir = 'contents/';
const config_file = 'config.yml';

const allowedUrlProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
const configOnlyKeys = ['nav', 'sections', 'backgrounds', 'background-interval-ms', 'background-overlay', 'logo', 'contact-form-email', 'contact-form-subject'];

function stringifyValue(value) {
    return value == null ? '' : value.toString();
}

function decodeText(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value);
    return textarea.value;
}

function setElementValue(element, value) {
    if (value && typeof value === 'object') {
        if ('text' in value) {
            element.textContent = decodeText(value.text);
        }
        if ('href' in value && element instanceof HTMLAnchorElement) {
            element.href = value.href;
        }
        return;
    }

    element.textContent = decodeText(value);
}

// --------------------------------------------------------------------------
// Navigation & Sections Rendering
// --------------------------------------------------------------------------

function normalizeSections(sections) {
    if (!Array.isArray(sections)) {
        return [];
    }

    return sections
        .map((section) => {
            if (typeof section === 'string' && section.trim() !== '') {
                return {
                    id: section,
                    nav: section.charAt(0).toUpperCase() + section.slice(1),
                    href: '#' + section,
                };
            }

            if (!section || typeof section !== 'object' || !section.id) {
                return null;
            }

            return {
                id: section.id,
                nav: section.nav || section.text || (section.id.charAt(0).toUpperCase() + section.id.slice(1)),
                title: section.title || section.heading || section.nav || section.text || (section.id.charAt(0).toUpperCase() + section.id.slice(1)),
                icon: section.icon || '',
                href: section.href || '#' + section.id,
            };
        })
        .filter(Boolean);
}

function getNavigationItems(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => ({
            text: section.nav,
            href: section.href,
        }));
    }

    return Array.isArray(yml.nav) ? yml.nav : [];
}

function renderNavigation(navItems) {
    const navbarItems = document.getElementById('navbar-items');
    if (!navbarItems || !Array.isArray(navItems)) {
        return;
    }

    navbarItems.replaceChildren();

    navItems.forEach((item) => {
        if (!item || !item.text || !item.href) {
            return;
        }

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        link.href = item.href;
        link.textContent = decodeText(item.text);

        link.addEventListener('click', (e) => {
            if (item.href.startsWith('#')) {
                const target = document.querySelector(item.href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        listItem.appendChild(link);
        navbarItems.appendChild(listItem);
    });
}

function renderSections(sections) {
    const sectionsContainer = document.getElementById('sections');
    if (!sectionsContainer) {
        return;
    }

    sectionsContainer.replaceChildren();

    sections.forEach((section) => {
        const sectionElement = document.createElement('section');
        const wrap = document.createElement('div');
        const header = document.createElement('div');
        const title = document.createElement('h2');
        const body = document.createElement('div');

        sectionElement.id = section.id;
        sectionElement.className = 'block';
        wrap.className = 'wrap';
        header.className = 'section-head';

        if (section.icon) {
            const icon = document.createElement('i');
            icon.classList.add('bi', section.icon);
            title.appendChild(icon);
            title.appendChild(document.createTextNode(' '));
        }

        title.appendChild(document.createTextNode(decodeText(section.title)));
        body.className = 'main-body';
        body.id = section.id + '-md';

        header.appendChild(title);
        wrap.appendChild(header);
        wrap.appendChild(body);
        sectionElement.appendChild(wrap);
        sectionsContainer.appendChild(sectionElement);
    });
}

function activateScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    if (!sections.length || !navLinks.length) return;

    function updateActiveNav() {
        let currentId = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                currentId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentId) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

// --------------------------------------------------------------------------
// Organic Bezier Rings & Multilingual Script Morph
// --------------------------------------------------------------------------

function blob(rx, ry, seed, amp) {
    const n = 120;
    const pts = [];
    for (let k = 0; k < n; k++) {
        const t = k / n * Math.PI * 2;
        const d = 1 + amp * (.55 * Math.sin(2 * t + seed) + .3 * Math.sin(3 * t + seed * 1.7) + .2 * Math.sin(5 * t + seed * .6));
        pts.push([Math.cos(t) * rx * d, Math.sin(t) * ry * d]);
    }
    let s = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (let k = 0; k < n; k++) {
        const p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
        s += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + "," + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + "," + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return s + "Z";
}

function initRingsAndMark() {
    const svg = document.getElementById("rings");
    if (svg) {
        const NS = "http://www.w3.org/2000/svg";
        const N = 12;
        svg.replaceChildren();
        for (let r = 0; r < N; r++) {
            const p = document.createElementNS(NS, "path");
            p.setAttribute("d", blob(330 + r * 38 + r * r * 4, 250 + r * 14 + r * r * .6, 1.1 + r * .28, .06 + r * .008));
            p.style.setProperty("--i", r);
            p.style.setProperty("--f", (r / (N - 1)).toFixed(3));
            svg.appendChild(p);
        }
    }
    const mark = document.querySelector("[data-ring]");
    if (mark) {
        mark.setAttribute("d", blob(44, 26, 1.1, .1));
    }
}

function initMultiScriptTitle() {
    const names = [
        ["ɪreːn", "en"],
        ["आइरेन", "hi"],
        ["ஐரென்", "ta"],
        ["ഐറെൻ", "ml"],
        ["আইরেন", "bn"],
        ["ಐರೆನ್", "kn"],
        ["ఐరెన్", "te"],
        ["ਆਈਰੇਨ", "pa"],
        ["ꯏꯔꯦꯟ", "mni"],
        ["አይረን", "am"]
    ];

    const el = document.getElementById("name");
    if (!el) return;

    let i = 0;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viramas = "\u094D\u09CD\u0A4D\u0BCD\u0C4D\u0CCD\u0D4D";

    function letters(str) {
        const parts = window.Intl && Intl.Segmenter
            ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), x => x.segment)
            : (str.match(/\P{M}\p{M}*/gu) || [str]);
        const out = [];
        parts.forEach((p) => {
            const prev = out[out.length - 1];
            if (prev && viramas.indexOf(prev.charAt(prev.length - 1)) > -1) {
                out[out.length - 1] = prev + p;
            } else {
                out.push(p);
            }
        });
        return out;
    }

    function build(str, lang, latin) {
        el.textContent = "";
        el.setAttribute("lang", lang);
        el.classList.toggle("latin", latin);
        return letters(str).map((ch) => {
            const slot = document.createElement("span");
            slot.className = "ch";
            const inner = document.createElement("i");
            inner.textContent = ch;
            slot.appendChild(inner);
            el.appendChild(slot);
            return inner;
        });
    }

    function rollOut(nodes) {
        return Promise.all(nodes.map((n, k) => {
            return n.animate([
                { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 },
                { transform: "perspective(500px) translateY(-120%) rotateX(70deg)", opacity: 0 }
            ], { duration: 560, delay: k * 70, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards" }).finished;
        }));
    }

    function rollIn(nodes) {
        return Promise.all(nodes.map((n, k) => {
            return n.animate([
                { transform: "perspective(500px) translateY(120%) rotateX(-70deg)", opacity: 0 },
                { transform: "perspective(500px) translateY(-6%) rotateX(6deg)", opacity: 1, offset: .7 },
                { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 }
            ], { duration: 900, delay: k * 95, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }).finished;
        }));
    }

    let current = build(names[0][0], names[0][1], true);
    if (reduce) {
        return;
    }

    current.forEach(n => { n.style.opacity = 0; });
    rollIn(current).then(() => { current.forEach(n => { n.style.opacity = ""; }); });

    const cycle = function () {
        setTimeout(() => {
            rollOut(current).then(() => {
                i = (i + 1) % names.length;
                current = build(names[i][0], names[i][1], i === 0);
                return rollIn(current);
            }).then(cycle);
        }, 3200);
    };

    setTimeout(cycle, 1500);
}

// --------------------------------------------------------------------------
// HTML Sanitization & Markdown Loading
// --------------------------------------------------------------------------

function sanitizeMarkdownHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('script, style, iframe, object, embed, link, meta, base').forEach((node) => {
        node.remove();
    });

    template.content.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (name.startsWith('on')) {
                node.removeAttribute(attribute.name);
                return;
            }

            if (['href', 'src'].includes(name)) {
                try {
                    const url = new URL(value, window.location.href);
                    if (!allowedUrlProtocols.includes(url.protocol)) {
                        node.removeAttribute(attribute.name);
                    }
                } catch {
                    node.removeAttribute(attribute.name);
                }
            }
        });
    });

    return template.innerHTML;
}

function loadConfig() {
    return fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => jsyaml.load(text) || {})
        .catch(error => {
            console.log(error);
            return {};
        });
}

function applyConfig(yml) {
    Object.keys(yml).forEach(key => {
        if (configOnlyKeys.includes(key)) {
            return;
        }

        const element = document.getElementById(key);
        const value = yml[key];

        if (!element) {
            return;
        }

        try {
            setElementValue(element, value);
        } catch {
            console.log("Invalid id and value: " + key + "," + stringifyValue(value));
        }
    });
}

function getConfiguredSections(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => section.id);
    }

    return [...document.querySelectorAll('[id$="-md"]')].map((element) => {
        return element.id.replace(/-md$/, '');
    });
}

// --------------------------------------------------------------------------
// Section Enhancers (Publications, News, People, Contact)
// --------------------------------------------------------------------------

function enhancePublications(container) {
    if (!container) return;

    const listItems = container.querySelectorAll('li');
    if (!listItems.length) return;

    // Filter controls
    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'filters';
    filtersDiv.setAttribute('role', 'group');
    filtersDiv.setAttribute('aria-label', 'Filter publications');
    filtersDiv.innerHTML = `
        <button type="button" data-filter="all" aria-pressed="true">All</button>
        <button type="button" data-filter="paper" aria-pressed="false">Papers</button>
        <button type="button" data-filter="tool" aria-pressed="false">Platforms & Tools</button>
    `;

    const pubsList = document.createElement('ul');
    pubsList.className = 'pubs';

    listItems.forEach(li => {
        const text = li.textContent || '';
        const html = li.innerHTML;

        // Detect kind
        let kind = 'paper';
        if (text.toLowerCase().includes('platform') || text.toLowerCase().includes('system demonstration') || text.toLowerCase().includes('toolkit')) {
            kind = 'tool';
        }

        // Year detection
        let year = '2026';
        const yearMatch = text.match(/\b(20\d\d)\b/);
        if (yearMatch) {
            year = yearMatch[1];
        }

        // Links extraction
        const linksDiv = document.createElement('div');
        linksDiv.className = 'links';
        li.querySelectorAll('a').forEach(a => {
            const linkClone = a.cloneNode(true);
            linkClone.textContent = linkClone.textContent.replace(/^\[|\]$/g, '');
            linksDiv.appendChild(linkClone);
        });

        // Content cleanup
        const temp = document.createElement('div');
        temp.innerHTML = html;
        temp.querySelectorAll('a').forEach(a => a.remove());

        const pubItem = document.createElement('li');
        pubItem.className = 'pub';
        pubItem.setAttribute('data-kind', kind);

        const yearDiv = document.createElement('div');
        yearDiv.className = 'year';
        yearDiv.textContent = year;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'pub-info';
        infoDiv.innerHTML = temp.innerHTML.trim();
        infoDiv.appendChild(linksDiv);

        pubItem.appendChild(yearDiv);
        pubItem.appendChild(infoDiv);
        pubsList.appendChild(pubItem);
    });

    // Replace original content with filters + enhanced pub list
    const originalLists = container.querySelectorAll('ul');
    originalLists.forEach(ul => ul.remove());
    container.insertBefore(filtersDiv, container.firstChild);
    container.appendChild(pubsList);

    // Filter event listeners
    const buttons = filtersDiv.querySelectorAll('button');
    const pubCards = pubsList.querySelectorAll('.pub');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            pubCards.forEach(card => {
                const cardKind = card.getAttribute('data-kind');
                card.hidden = !(filter === 'all' || cardKind === filter);
            });
        });
    });
}

function enhanceNews(container) {
    if (!container) return;
    const listItems = container.querySelectorAll('li');
    if (!listItems.length) return;

    const newsGrid = document.createElement('div');
    newsGrid.className = 'news';

    listItems.forEach(li => {
        const article = document.createElement('article');
        const strong = li.querySelector('strong');
        let timeText = 'Recent';

        if (strong) {
            timeText = strong.textContent.replace(/:$/, '').trim();
            strong.remove();
        }

        const time = document.createElement('time');
        time.textContent = timeText;

        const p = document.createElement('p');
        p.innerHTML = li.innerHTML.replace(/^[:\s-]+/, '').trim();

        article.appendChild(time);
        article.appendChild(p);
        newsGrid.appendChild(article);
    });

    const ul = container.querySelector('ul');
    if (ul) ul.replaceWith(newsGrid);
}

function enhanceCollaborators(container) {
    if (!container) return;
    const people = container.querySelectorAll('.person');
    people.forEach((p, idx) => {
        const initials = p.querySelector('.initials');
        if (initials) {
            initials.classList.add('avatar');
        }
    });
}

function loadMarkdownSection(name) {
    return fetch(content_dir + name + '.md')
        .then(response => response.text())
        .then(markdown => {
            const target = document.getElementById(name + '-md');
            if (!target) {
                return;
            }

            const html = sanitizeMarkdownHtml(marked.parse(markdown));
            target.innerHTML = html;

            // Apply specialized section formatting
            if (name === 'publications') {
                enhancePublications(target);
            } else if (name === 'news') {
                enhanceNews(target);
            } else if (name === 'collaborators') {
                enhanceCollaborators(target);
            }
        })
        .catch(error => console.log(error));
}

// --------------------------------------------------------------------------
// Contact Form Submission (FormSubmit)
// --------------------------------------------------------------------------

function renderContactForm(yml) {
    const target = document.getElementById('contact-md');
    const email = yml['contact-form-email'];
    if (!target || !email) {
        return;
    }

    const originalContent = target.innerHTML;
    target.innerHTML = '';

    const joinCard = document.createElement('div');
    joinCard.className = 'join-card';

    const joinIntro = document.createElement('div');
    joinIntro.className = 'join-intro';
    joinIntro.innerHTML = `
        <h3>Connect with ɪreːn</h3>
        ${originalContent}
    `;

    const form = document.createElement('form');
    form.className = 'contact-form';
    form.noValidate = true;
    form.innerHTML = `
        <div class="contact-row">
            <div class="contact-field">
                <label for="cf-name">Name</label>
                <input id="cf-name" name="name" type="text" autocomplete="name" required placeholder="Your name">
            </div>
            <div class="contact-field">
                <label for="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" autocomplete="email" required placeholder="your.email@domain.org">
            </div>
        </div>
        <div class="contact-field">
            <label for="cf-message">Message</label>
            <textarea id="cf-message" name="message" rows="5" required placeholder="Tell us about your interests, language, or question..."></textarea>
        </div>
        <input type="text" name="_honey" class="contact-honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="contact-submit">Send message</button>
        <p class="contact-status" role="status" aria-live="polite"></p>
    `;

    const status = form.querySelector('.contact-status');
    const button = form.querySelector('.contact-submit');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (form.elements._honey.value) {
            return;
        }

        if (!form.checkValidity()) {
            status.textContent = 'Please complete all fields with a valid email address.';
            status.className = 'contact-status is-error';
            return;
        }

        button.disabled = true;
        status.textContent = 'Sending...';
        status.className = 'contact-status';

        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                name: form.elements.name.value,
                email: form.elements.email.value,
                message: form.elements.message.value,
                _subject: yml['contact-form-subject'] || 'New message from ɪreːn website',
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success === 'true' || data.success === true) {
                    status.textContent = 'Thank you! Your message has been sent.';
                    status.className = 'contact-status is-success';
                    form.reset();
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            })
            .catch(() => {
                status.textContent = 'Could not send right now. Please write directly to the coordinator.';
                status.className = 'contact-status is-error';
            })
            .finally(() => {
                button.disabled = false;
            });
    });

    joinCard.appendChild(joinIntro);
    joinCard.appendChild(form);
    target.appendChild(joinCard);
}

// --------------------------------------------------------------------------
// Gallery & Lightbox
// --------------------------------------------------------------------------

function initGallery() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    const figures = [...gallery.querySelectorAll('figure.slide')];
    if (figures.length === 0) return;

    let box = document.querySelector('.lightbox');
    if (!box) {
        box = document.createElement('div');
        box.className = 'lightbox';
        box.hidden = true;
        box.innerHTML = `
            <button type="button" class="lightbox-close" aria-label="Close photo">&times;</button>
            <button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249;</button>
            <figure class="lightbox-figure">
                <img class="lightbox-img" alt="">
                <figcaption class="lightbox-caption"></figcaption>
            </figure>
            <button type="button" class="lightbox-next" aria-label="Next photo">&#8250;</button>
        `;
        document.body.appendChild(box);
    }

    const img = box.querySelector('.lightbox-img');
    const caption = box.querySelector('.lightbox-caption');
    let current = 0;

    const items = figures.map(f => {
        const image = f.querySelector('img');
        const cap = f.querySelector('figcaption');
        return {
            src: image ? image.src : '',
            alt: image ? image.alt : '',
            caption: cap ? cap.textContent : ''
        };
    });

    function show(index) {
        current = (index + items.length) % items.length;
        img.src = items[current].src;
        img.alt = items[current].alt;
        caption.textContent = items[current].caption;
    }

    function open(index) {
        show(index);
        box.hidden = false;
        document.body.classList.add('lightbox-open');
    }

    function close() {
        box.hidden = true;
        document.body.classList.remove('lightbox-open');
    }

    figures.forEach((figure, index) => {
        figure.tabIndex = 0;
        figure.setAttribute('role', 'button');
        figure.addEventListener('click', () => open(index));
        figure.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(index);
            }
        });
    });

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    box.addEventListener('click', (e) => {
        if (e.target === box) close();
    });
    document.addEventListener('keydown', (e) => {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
    });
}

// --------------------------------------------------------------------------
// IPA Font Wrapper (ɪreːn)
// --------------------------------------------------------------------------

const groupName = 'ɪreːn';

function markGroupName(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue.includes(groupName)) {
                return NodeFilter.FILTER_REJECT;
            }
            const parent = node.parentElement;
            if (!parent || parent.closest('script, style, textarea, title, .iren-name')) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(groupName).forEach((part, index) => {
            if (index > 0) {
                const span = document.createElement('span');
                span.className = 'iren-name';
                span.textContent = groupName;
                fragment.appendChild(span);
            }
            if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        node.parentNode.replaceChild(fragment, node);
    });
}

function typesetMath() {
    if (!window.MathJax || !MathJax.startup || !MathJax.typesetPromise) {
        return Promise.resolve();
    }
    return MathJax.startup.promise.then(() => MathJax.typesetPromise());
}

function markSiteReady() {
    document.body.classList.remove('site-loading');
    document.body.classList.add('site-ready');
}

// --------------------------------------------------------------------------
// App Initialization
// --------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
    marked.use({ mangle: false, headerIds: false });

    initRingsAndMark();
    initMultiScriptTitle();

    loadConfig()
        .then((yml) => {
            window.siteConfig = yml;
            applyConfig(yml);
            const sections = normalizeSections(yml.sections);

            renderNavigation(getNavigationItems(yml));
            renderSections(sections);
            activateScrollSpy();

            return Promise.all(getConfiguredSections(yml).map(loadMarkdownSection));
        })
        .then(() => renderContactForm(window.siteConfig || {}))
        .then(() => initGallery())
        .then(() => markGroupName(document.body))
        .then(() => typesetMath())
        .catch(error => console.log(error))
        .finally(() => markSiteReady());
});
