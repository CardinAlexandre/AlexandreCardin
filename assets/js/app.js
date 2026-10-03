/* ==========================================================================
   Alexandre Cardin — portfolio
   Vanilla JavaScript on top of GSAP, ScrollTrigger and Lenis. No build step.

   Contents
     1. Language                9. Metal: sparks
     2. Text splitting         10. Metal: welding game
     3. Toulouse clock         11. Wood: axe throwing
     4. Contact form           12. Toulouse: sunbeam catcher
     5. Custom cursor          13. Code: CRT head
     6. Hero title             14. Code: easter egg
     7. Marquees               15. Scroll choreography
     8. Story paging           16. Loader & intro
   ========================================================================== */
(function () {
	'use strict';

	var html = document.documentElement;
	var lang = html.lang === 'en' ? 'en' : 'fr';
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var hasGsap = !!(window.gsap && window.ScrollTrigger);
	var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
	var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

	function store(kind, key, value) {
		try {
			var s = kind === 'local' ? localStorage : sessionStorage;
			if (value === undefined) return s.getItem(key);
			if (value === null) s.removeItem(key); else s.setItem(key, value);
		} catch (e) { return null; }
	}

	/* ----------------------------------------------------------------------
	   1. Language (French lives in the HTML, English in i18n.js)
	   ---------------------------------------------------------------------- */
	function t(key) {
		var dict = lang === 'en' ? window.I18N_EN : window.I18N_FR_DYNAMIC;
		return (dict && dict[key]) || key;
	}

	function applyLanguage() {
		if (lang === 'en' && window.I18N_EN) {
			$$('[data-i18n]').forEach(function (el) {
				var v = window.I18N_EN[el.getAttribute('data-i18n')];
				if (v !== undefined) el.innerHTML = v;
			});
			$$('[data-i18n-attr]').forEach(function (el) {
				el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
					var p = pair.split(':'), v = window.I18N_EN[p[1]];
					if (v !== undefined) el.setAttribute(p[0], v);
				});
			});
			$('#cv-link').href = '/English-Version-CV-Alexandre-Cardin.pdf';
			document.title = 'Alexandre Cardin — C#/.NET full-stack developer · Toulouse';
		}

		$('#lang-btn').addEventListener('click', function () {
			store('local', 'portfolio-lang', lang === 'fr' ? 'en' : 'fr');
			store('session', 'ac-switch', '1');
			html.classList.add('is-switching');
			setTimeout(function () { location.reload(); }, reduce ? 0 : 650);
		});
	}

	/* ----------------------------------------------------------------------
	   2. Text splitting: letters for the big titles, words for the manifesto
	   ---------------------------------------------------------------------- */
	function splitLetters(el) {
		var text = el.textContent.trim();
		el.textContent = '';
		Array.prototype.forEach.call(text, function (c) {
			var s = document.createElement('span');
			s.className = 'ch';
			s.textContent = c === ' ' ? ' ' : c;
			el.appendChild(s);
		});
	}

	function splitWords(el) {
		Array.prototype.slice.call(el.childNodes).forEach(function (node) {
			if (node.nodeType === 3) {
				var frag = document.createDocumentFragment();
				node.textContent.split(/(\s+)/).forEach(function (part) {
					if (!part) return;
					if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
					var s = document.createElement('span');
					s.className = 'w';
					s.textContent = part;
					frag.appendChild(s);
				});
				node.parentNode.replaceChild(frag, node);
			} else if (node.nodeType === 1) {
				node.classList.add('w');
			}
		});
	}

	/* ----------------------------------------------------------------------
	   3. Toulouse clock
	   ---------------------------------------------------------------------- */
	function clock() {
		var el = $('#clock');
		var fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
		var tick = function () { el.textContent = fmt.format(new Date()); };
		tick();
		setInterval(tick, 20000);
	}

	/* ----------------------------------------------------------------------
	   4. Contact form
	   Posts JSON to /api/contact (portfolio-mailer, proxied by nginx).
	   ---------------------------------------------------------------------- */
	function contactForm() {
		var form = $('#contact-form');
		var status = $('#form-status');
		var btn = $('.send', form);
		var label = $('.send__label', form);
		var idle = label.innerHTML;

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var data = {
				name: $('#name').value.trim(),
				email: $('#email').value.trim(),
				message: $('#message').value.trim(),
				website: $('#website').value // honeypot field
			};
			var bad = [];
			if (!data.name) bad.push('name');
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) bad.push('email');
			if (!data.message) bad.push('message');
			$$('.field', form).forEach(function (f) { f.classList.toggle('is-invalid', bad.indexOf($('input,textarea', f).name) > -1); });
			status.className = 'form__status';
			if (bad.length) { status.textContent = t('form.invalid'); status.classList.add('is-ko'); return; }

			btn.disabled = true;
			label.textContent = t('form.sending');
			status.textContent = '';

			var ctrl = 'AbortController' in window ? new AbortController() : null;
			var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 20000);

			// portfolio-mailer service, proxied by nginx on the same origin
			fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				signal: ctrl ? ctrl.signal : undefined
			})
				.then(function (res) {
					if (!res.ok) throw res.status;
					form.reset();
					btn.classList.add('is-ok');
					label.textContent = t('form.sent');
					status.textContent = t('form.ok');
					status.classList.add('is-ok');
					if (hasGsap && !reduce) confetti(btn);
				})
				.catch(function (code) {
					label.innerHTML = idle;
					status.textContent = t(code === 400 ? 'form.invalid' : code === 429 ? 'form.throttled' : 'form.ko');
					status.classList.add('is-ko');
				})
				.then(function () {
					clearTimeout(timer);
					setTimeout(function () { btn.disabled = false; btn.classList.remove('is-ok'); label.innerHTML = idle; }, 4000);
				});
		});
	}

	function confetti(origin) {
		var r = origin.getBoundingClientRect();
		var colors = ['#c8ff2e', '#ff3c8e', '#2f3cff', '#ffd400', '#ff5a1f'];
		for (var i = 0; i < 36; i++) {
			var p = document.createElement('i');
			p.style.cssText = 'position:fixed;z-index:9998;pointer-events:none;width:10px;height:14px;border-radius:2px;' +
				'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;background:' + colors[i % colors.length];
			document.body.appendChild(p);
			gsap.to(p, {
				x: gsap.utils.random(-260, 260), y: gsap.utils.random(-320, 60), rotation: gsap.utils.random(-540, 540),
				opacity: 0, duration: gsap.utils.random(1, 1.8), ease: 'power3.out',
				onComplete: p.remove.bind(p)
			});
		}
	}

	/* ----------------------------------------------------------------------
	   5. Custom cursor and magnetic buttons
	   ---------------------------------------------------------------------- */
	var mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
	window.addEventListener('pointermove', function (e) {
		if (e.pointerType !== 'mouse') return;
		mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
	}, { passive: true });

	function cursor() {
		var root = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
		var rx = mouse.x, ry = mouse.y;
		gsap.ticker.add(function () {
			rx += (mouse.x - rx) * 0.18;
			ry += (mouse.y - ry) * 0.18;
			dot.style.transform = 'translate(' + mouse.x + 'px,' + mouse.y + 'px)';
			ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
		});
		document.addEventListener('pointerover', function (e) {
			var el = e.target.closest('a, button, [data-cursor], input, textarea');
			if (!el) return;
			root.classList.add('is-hover');
			label.textContent = el.getAttribute('data-cursor') || '';
		});
		document.addEventListener('pointerout', function (e) {
			var el = e.target.closest('a, button, [data-cursor], input, textarea');
			if (el && !el.contains(e.relatedTarget)) root.classList.remove('is-hover');
		});
		document.addEventListener('pointerdown', function () { root.classList.add('is-down'); });
		document.addEventListener('pointerup', function () { root.classList.remove('is-down'); });
	}

	function magnetic() {
		$$('[data-magnetic]').forEach(function (el) {
			var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
			var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				xTo((e.clientX - r.left - r.width / 2) * 0.35);
				yTo((e.clientY - r.top - r.height / 2) * 0.35);
			});
			el.addEventListener('pointerleave', function () {
				gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)' });
			});
		});
	}

	/* ----------------------------------------------------------------------
	   6. Hero title: the font weight "breathes" under the cursor
	   ---------------------------------------------------------------------- */
	function breathingTitle() {
		var letters = $$('.hero__title .ch').map(function (el) { return { el: el, w: 800, s: 75 }; });
		var hero = $('.hero'), visible = true;
		new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
		gsap.ticker.add(function () {
			if (!visible || !mouse.active) return;
			letters.forEach(function (l) {
				var r = l.el.getBoundingClientRect();
				var d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
				var k = Math.max(0, 1 - d / 380);
				l.w += (800 - 600 * k - l.w) * 0.12;
				l.s += (75 + 25 * k - l.s) * 0.12;
				l.el.style.fontWeight = l.w.toFixed(0);
				l.el.style.fontStretch = l.s.toFixed(1) + '%';
			});
		});
	}

	/* ----------------------------------------------------------------------
	   7. Marquees that speed up with the scroll velocity
	   ---------------------------------------------------------------------- */
	function marquees(getVelocity) {
		$$('[data-marquee]').forEach(function (track) {
			var dir = parseFloat(track.getAttribute('data-marquee'));
			var unit = track.firstElementChild;
			var x = 0, sign = 1, w = 1, wrap;
			function measure() {
				w = unit.offsetWidth || 1;
				while (track.scrollWidth < innerWidth * 2 + w) track.appendChild(unit.cloneNode(true));
				wrap = gsap.utils.wrap(-w, 0);
			}
			measure();
			window.addEventListener('resize', measure);
			if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
			gsap.ticker.add(function (time, dt) {
				var v = getVelocity();
				if (Math.abs(v) > 0.5) sign = v > 0 ? 1 : -1;
				x = wrap(x - dir * sign * (0.06 + Math.min(Math.abs(v) * 0.012, 0.9)) * dt);
				track.style.transform = 'translate3d(' + x + 'px,0,0)';
			});
		});
	}

	/* ----------------------------------------------------------------------
	   8. Story: strict step-by-step paging
	   Inside the story, each wheel gesture (or ↑ ↓, Page Up/Down, Space) moves
	   exactly one step, with a fixed-length transition: the view can never rest
	   between two steps. Touchpad inertia is swallowed so no step is skipped.
	   Entering the story snaps to the first or last step; scrolling past either
	   end leaves the story normally.
	   ---------------------------------------------------------------------- */
	function pagedPanels(lenis, st, count) {
		var DURATION = 0.85, INERTIA_GAP = 160, INERTIA_WINDOW = 900;
		var animating = false, current = 0, lastWheel = 0, settledAt = 0, guard = null, idle = null;

		function bounds() {
			var start = st.start, end = st.end;
			return { start: start, end: end, step: (end - start) / (count - 1) };
		}
		function indexAt(y, b) { return Math.max(0, Math.min(count - 1, Math.round((y - b.start) / b.step))); }

		function goTo(i) {
			var b = bounds();
			current = i;
			animating = true;
			clearTimeout(guard);
			guard = setTimeout(done, DURATION * 1000 + 400);
			lenis.scrollTo(b.start + i * b.step, {
				duration: DURATION, force: true,
				easing: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
				onComplete: done
			});
		}
		function done() {
			clearTimeout(guard);
			animating = false;
			settledAt = performance.now();
		}

		// Mouse wheel: intercepted before Lenis handles it
		lenis.options.virtualScroll = function (data) {
			var ev = data.event;
			if (!ev || ev.type !== 'wheel' || Math.abs(data.deltaY) < 1) return true;
			var now = performance.now(), gap = now - lastWheel;
			lastWheel = now;
			var b = bounds(), y = lenis.scroll, dir = data.deltaY > 0 ? 1 : -1;
			var inside = y >= b.start - 2 && y <= b.end + 2;

			if (!inside) {
				// Entering the story: snap to the first (or last) step
				var to = lenis.targetScroll + data.deltaY;
				if (dir > 0 && y < b.start && to >= b.start) { ev.preventDefault(); goTo(0); return false; }
				if (dir < 0 && y > b.end && to <= b.end) { ev.preventDefault(); goTo(count - 1); return false; }
				return true;
			}

			// Transition running, or inertia tail of the same gesture: swallow it
			if (animating || (gap < INERTIA_GAP && now - settledAt < INERTIA_WINDOW)) { ev.preventDefault(); return false; }

			var next = indexAt(y, b) + dir;
			if (next < 0 || next > count - 1) return true; // leave the story through the top or the bottom
			ev.preventDefault();
			goTo(next);
			return false;
		};

		// Keyboard: one step per key press
		function onKey(e) {
			if (e.defaultPrevented || /input|textarea|select/i.test(e.target.tagName)) return;
			var dir = 0;
			if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
			else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
			if (!dir) return;
			var b = bounds(), y = lenis.scroll;
			if (y < b.start - 2 || y > b.end + 2) return;
			var next = (animating ? current : indexAt(y, b)) + dir;
			if (next < 0 || next > count - 1) return;
			e.preventDefault();
			if (!animating) goTo(next);
		}
		window.addEventListener('keydown', onKey);

		// Safety net (scrollbar, anchor link…): if we stop between two steps, snap back
		var unsubscribe = lenis.on('scroll', function () {
			if (animating) return;
			clearTimeout(idle);
			idle = setTimeout(function () {
				if (animating) return;
				var b = bounds(), y = lenis.scroll;
				if (y < b.start + 2 || y > b.end - 2) return;
				var i = indexAt(y, b);
				if (Math.abs(b.start + i * b.step - y) > 2) goTo(i);
				else current = i;
			}, 220);
		});

		return function () {
			lenis.options.virtualScroll = undefined;
			window.removeEventListener('keydown', onKey);
			clearTimeout(guard); clearTimeout(idle);
			if (typeof unsubscribe === 'function') unsubscribe();
		};
	}

	/* ----------------------------------------------------------------------
	   9. Metal: welding sparks (canvas)
	   ---------------------------------------------------------------------- */
	function sparks(weld) {
		var canvas = $('.sparks');
		var panel = canvas.parentElement;
		var ctx = canvas.getContext('2d');
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		var parts = [], running = false, W = 0, H = 0, t0 = 0;

		function size() {
			W = panel.offsetWidth; H = panel.offsetHeight;
			canvas.width = W * dpr; canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		size();
		window.addEventListener('resize', size);

		function frame(now) {
			if (!running) return;
			t0 += 0.016;
			// Player's torch while welding, otherwise an idle demo along the seam
			var torch = weld.torch.active ? weld.torch : weld.idlePoint(0.5 + 0.5 * Math.sin(t0 * 0.35));
			var pr = panel.getBoundingClientRect();
			var ex = (torch.x - pr.left) * (W / pr.width), ey = (torch.y - pr.top) * (H / pr.height);
			var n = weld.torch.active ? 10 : 4;
			for (var i = 0; i < n; i++) {
				var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
				var sp = 3 + Math.random() * 9;
				parts.push({ x: ex, y: ey, px: ex, py: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.008 + Math.random() * 0.02 });
			}
			ctx.globalCompositeOperation = 'source-over';
			ctx.clearRect(0, 0, W, H);
			ctx.globalCompositeOperation = 'lighter';
			var glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 90);
			glow.addColorStop(0, 'rgba(255,200,120,.55)');
			glow.addColorStop(1, 'rgba(255,90,31,0)');
			ctx.fillStyle = glow;
			ctx.fillRect(ex - 90, ey - 90, 180, 180);
			ctx.lineCap = 'round';
			for (var j = parts.length - 1; j >= 0; j--) {
				var p = parts[j];
				p.px = p.x; p.py = p.y;
				p.vy += 0.28; p.vx *= 0.985;
				p.x += p.vx; p.y += p.vy;
				if (p.y > H - 4 && p.vy > 0) { p.vy *= -0.35; p.vx *= 0.7; }
				p.life -= p.decay;
				if (p.life <= 0) { parts.splice(j, 1); continue; }
				ctx.strokeStyle = 'rgba(255,' + (140 + 115 * p.life | 0) + ',' + (60 * p.life | 0) + ',' + p.life + ')';
				ctx.lineWidth = 1 + p.life * 1.6;
				ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
			}
			requestAnimationFrame(frame);
		}
		new IntersectionObserver(function (en) {
			var was = running;
			running = en[0].isIntersecting;
			if (running && !was) requestAnimationFrame(frame);
		}).observe(panel);
	}

	/* ----------------------------------------------------------------------
	   10. Metal: welding mini-game (Piriou shipyard)
	   Hold the click on the start dot and follow the seam.
	   Grade = welded length × (accuracy + steady speed).
	   Too fast leaves holes in the bead, too slow burns it.
	   ---------------------------------------------------------------------- */
	function weldingGame() {
		var art = $('.art-ship');
		var svg = $('svg', art);
		var guide = $('.weld-guide', svg), zone = $('.weld-zone', svg);
		var startDot = $('.weld-start', svg), endDot = $('.weld-end', svg);
		var beads = $('.weld-beads', svg);
		var lastEl = $('.weld-last', art), bestEl = $('.weld-best', art);

		// Hull seams (600×400 SVG coordinates)
		var SEAMS = ['M118 228 H470', 'M126 270 H520', 'M358 194 V318', 'M150 300 C250 312 380 312 486 290'];
		var coarse = window.matchMedia('(pointer: coarse)').matches;
		var SAMPLES = 120, TOL = coarse ? 42 : 26, SLOW = 70, FAST = 430; // tolerance (SVG units, wider for fingers) and speeds in SVG units per second
		if (coarse) zone.style.strokeWidth = '72';
		var pts = [], seamIndex = -1, best = 0, cooling = false;
		var torch = { active: false, x: 0, y: 0 };
		var run = null;

		try { best = parseInt(localStorage.getItem('ac-weld-best'), 10) || 0; } catch (e) {}
		if (best) bestEl.textContent = best + '%';

		function toSvg(cx, cy) {
			var pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
			return pt.matrixTransform(svg.getScreenCTM().inverse());
		}
		function toScreen(p) {
			var pt = svg.createSVGPoint(); pt.x = p.x; pt.y = p.y;
			return pt.matrixTransform(svg.getScreenCTM());
		}

		function nextSeam() {
			var i;
			do { i = Math.floor(Math.random() * SEAMS.length); } while (i === seamIndex && SEAMS.length > 1);
			seamIndex = i;
			guide.setAttribute('d', SEAMS[i]);
			zone.setAttribute('d', SEAMS[i]);
			var len = guide.getTotalLength();
			pts = [];
			for (var k = 0; k <= SAMPLES; k++) pts.push(guide.getPointAtLength(len * k / SAMPLES));
			startDot.setAttribute('cx', pts[0].x); startDot.setAttribute('cy', pts[0].y);
			endDot.setAttribute('cx', pts[SAMPLES].x); endDot.setAttribute('cy', pts[SAMPLES].y);
		}

		function nearest(p, from, to) {
			var bi = from, bd = Infinity;
			for (var k = Math.max(0, from); k <= Math.min(SAMPLES, to); k++) {
				var d = Math.hypot(p.x - pts[k].x, p.y - pts[k].y);
				if (d < bd) { bd = d; bi = k; }
			}
			return { i: bi, d: bd };
		}

		function bead(p, cls) {
			var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
			c.setAttribute('r', cls === 'burn' ? 5.6 : 4.4);
			c.setAttribute('class', 'hot' + (cls ? ' ' + cls : ''));
			beads.appendChild(c);
			setTimeout(function () { c.classList.remove('hot'); }, 450);
		}

		// Mobile: a finger on the seam must not scroll the page
		// (several mobile browsers ignore touch-action on SVG elements).
		zone.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
		zone.addEventListener('touchmove', function (e) { if (run) e.preventDefault(); }, { passive: false });

		zone.addEventListener('pointerdown', function (e) {
			if (cooling || run) return;
			var p = toSvg(e.clientX, e.clientY);
			if (Math.hypot(p.x - pts[0].x, p.y - pts[0].y) > TOL) { stamp(null, t('game.start')); return; }
			e.preventDefault();
			try { zone.setPointerCapture(e.pointerId); } catch (err) {}
			art.classList.add('is-welding');
			run = { progress: 0, samples: [], last: p, lastTime: performance.now(), lastBead: p, speed: 200 };
			torch.active = true; torch.x = e.clientX; torch.y = e.clientY;
			bead(p);
		});

		zone.addEventListener('pointermove', function (e) {
			if (!run) return;
			var now = performance.now(), p = toSvg(e.clientX, e.clientY);
			var dt = Math.max(1, now - run.lastTime) / 1000;
			var inst = Math.hypot(p.x - run.last.x, p.y - run.last.y) / dt;
			run.speed = run.speed * 0.7 + inst * 0.3; // smoothed speed
			run.last = p; run.lastTime = now;
			torch.x = e.clientX; torch.y = e.clientY;

			var n = nearest(p, run.progress - 6, run.progress + 14);
			if (n.d < TOL * 1.4) run.progress = Math.max(run.progress, n.i);
			run.samples.push({ dev: n.d, speed: run.speed });

			// The bead is laid drop by drop: too fast leaves holes, too slow burns
			if (Math.hypot(p.x - run.lastBead.x, p.y - run.lastBead.y) >= 3) {
				if (run.speed <= FAST) bead(p, run.speed < SLOW ? 'burn' : '');
				run.lastBead = p;
			}
			if (run.progress >= SAMPLES - 1 && Math.hypot(p.x - pts[SAMPLES].x, p.y - pts[SAMPLES].y) < TOL) finish();
		});

		zone.addEventListener('pointerup', function () { if (run) finish(); });
		zone.addEventListener('pointercancel', function () { if (run) finish(); });

		function finish() {
			var r = run; run = null;
			torch.active = false;
			art.classList.remove('is-welding');
			var n = r.samples.length || 1;
			var acc = 0, steady = 0;
			r.samples.forEach(function (s) {
				acc += Math.max(0, 1 - s.dev / TOL);
				if (s.speed >= SLOW && s.speed <= FAST) steady += 1;
			});
			var coverage = r.progress / SAMPLES;
			var score = Math.round(100 * coverage * (0.55 * acc / n + 0.45 * steady / n));
			lastEl.textContent = score + '%';
			if (score > best) {
				best = score; bestEl.textContent = best + '%';
				try { localStorage.setItem('ac-weld-best', String(best)); } catch (e) {}
			}
			var verdict = score >= 90 ? 'game.v1' : score >= 75 ? 'game.v2' : score >= 50 ? 'game.v3' : 'game.v4';
			stamp(score + '%', t(verdict));

			// Let the bead cool down, then move on to the next seam
			cooling = true;
			setTimeout(function () {
				var old = beads.querySelectorAll('circle');
				var clear = function () { beads.innerHTML = ''; nextSeam(); cooling = false; };
				if (reduce || !old.length) return clear();
				gsap.to(old, { opacity: 0, duration: 0.5, onComplete: clear });
			}, 1800);
		}

		function stamp(big, small) {
			var el = document.createElement('div');
			el.className = 'weld-stamp';
			el.innerHTML = (big ? big : '') + '<small>' + small + '</small>';
			art.appendChild(el);
			if (reduce) { setTimeout(el.remove.bind(el), 1600); return; }
			gsap.timeline({ onComplete: el.remove.bind(el) })
				.fromTo(el, { scale: 0.4, rotate: -12, opacity: 0 }, { scale: 1, rotate: -4, opacity: 1, duration: 0.45, ease: 'back.out(2.5)' })
				.to(el, { opacity: 0, y: -30, duration: 0.5 }, '+=1');
		}

		nextSeam();

		return {
			torch: torch,
			// Demo torch position, k ∈ [0, 1] along the seam, in screen coordinates
			idlePoint: function (k) { return toScreen(pts[Math.round(k * SAMPLES)]); }
		};
	}

	/* ----------------------------------------------------------------------
	   11. Wood: axe throwing mini-game
	   Clicking the log plants a Viking axe in it (10 at most, the oldest falls).
	   Pinning a falling maple leaf scores 1 point + a combo bonus; a miss resets the combo.
	   ---------------------------------------------------------------------- */
	function axeThrowing() {
		var target = $('.art-wood');
		if (!target) return;
		var log = $('svg', target);
		var MAX = 10, axes = [];
		var panel = target.closest('.panel');
		var scoreEl = $('.scoreboard__score', target), comboEl = $('.scoreboard__combo', target);
		var score = 0, combo = 0;
		// Offset so the blade edge lands exactly on the clicked point
		var ANCHOR = { xPercent: -5.7, yPercent: -50.7 };
		// Bearded Viking axe: crescent blade, beard along the haft, leather-wrapped handle.
		// The blade edge (impact point) sits at (8, 71) in the 140×140 viewBox.
		var markup = '<svg viewBox="0 0 140 140" aria-hidden="true">' +
			'<ellipse class="axe__cut" cx="8" cy="71" rx="17" ry="4" transform="rotate(60 8 71)" />' +
			'<path class="axe__handle-out" d="M34 34 L126 126" /><path class="axe__handle" d="M34 34 L126 126" />' +
			'<path class="axe__grain" d="M66 66 L92 92" />' +
			'<path class="axe__wrap" d="M95 103 L103 95 M102 110 L110 102 M109 117 L117 109" />' +
			'<circle class="axe__knob" cx="127" cy="127" r="6" />' +
			'<path class="axe__head" d="M39 39 C30 41 15 37 3 48 C-1 66 11 90 35 94 C40 84 50 70 60 60 L52 52 Z" />' +
			'<path class="axe__bevel" d="M13 51 C9 64 17 80 33 86" />' +
			'<path class="axe__edge" d="M5 51 C2 67 13 86 33 91" />' +
			'<path class="axe__rune" d="M26 57 L32 63 L26 69 L20 63 Z M33 50 L37 46 M39 57 L43 53" />' +
			'<circle class="axe__eye" cx="45" cy="45" r="3.2" />' +
			'</svg>';

		target.addEventListener('click', function (e) {
			// Only on the wood itself: the transparent SVG background doesn't count
			if (e.target === log || !log.contains(e.target)) return;
			var r = target.getBoundingClientRect();
			throwAxe((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
		});

		function throwAxe(x, y) {
			var axe = document.createElement('div');
			axe.className = 'axe';
			axe.style.left = x + '%';
			axe.style.top = y + '%';
			axe.innerHTML = markup;
			target.appendChild(axe);
			axes.push(axe);
			if (axes.length > MAX) dropAxe(axes.shift());

			var tilt = gsap.utils.random(-30, 24);
			if (reduce) { gsap.set(axe, Object.assign({ rotate: tilt }, ANCHOR)); resolveHit(x, y, axe); return; }

			var size = target.offsetWidth;
			gsap.timeline()
				.fromTo(axe,
					Object.assign({ x: size * 1.2, y: size * 0.8, scale: 2.6, rotate: tilt + 1080 }, ANCHOR),
					{ x: 0, y: 0, scale: 1, rotate: tilt, duration: 0.45, ease: 'power2.in' })
				.add(function () { impact(x, y); resolveHit(x, y, axe); })
				.fromTo(axe.firstChild, { rotate: 9 }, { rotate: 0, duration: 0.7, ease: 'elastic.out(1.2, .25)' });
		}

		function impact(x, y) {
			gsap.fromTo(log, { x: -6, y: 3 }, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, .3)', overwrite: true });
			for (var i = 0; i < 7; i++) {
				var chip = document.createElement('span');
				chip.className = 'woodchip';
				chip.style.left = x + '%';
				chip.style.top = y + '%';
				target.appendChild(chip);
				gsap.to(chip, {
					x: gsap.utils.random(-70, 70), y: gsap.utils.random(-80, 10), rotate: gsap.utils.random(-360, 360),
					opacity: 0, duration: gsap.utils.random(0.5, 0.9), ease: 'power2.out',
					onComplete: chip.remove.bind(chip)
				});
			}
		}

		// The axe just landed: did it pin a maple leaf on its way?
		function resolveHit(x, y, axe) {
			var r = target.getBoundingClientRect();
			var px = r.left + x / 100 * r.width, py = r.top + y / 100 * r.height;
			var hit = null, best = Infinity;
			$$('.maple:not(.maple--pinned)', panel).forEach(function (leaf) {
				var lr = leaf.getBoundingClientRect();
				var d = Math.hypot(px - (lr.left + lr.width / 2), py - (lr.top + lr.height / 2));
				if (d < lr.width * 0.6 + 8 && d < best) { best = d; hit = leaf; }
			});

			if (!hit) { combo = 0; renderScore(); return; }

			combo += 1;
			score += combo; // 1 point + combo bonus (0, 1, 2… for each consecutive hit)
			renderScore(true);
			pinLeaf(axe);
			respawn(hit);
			popScore(x, y, combo);
		}

		function pinLeaf(axe) {
			var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			leaf.setAttribute('class', 'maple maple--pinned');
			leaf.innerHTML = '<use href="#maple-leaf" />';
			axe.insertBefore(leaf, axe.firstChild);
			gsap.fromTo(leaf, { scale: 1.6, rotate: gsap.utils.random(-50, 50) }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
		}

		// The hit leaf starts falling again from the top, like a new one
		function respawn(leaf) {
			leaf.style.animation = 'none';
			void leaf.getBoundingClientRect();
			leaf.style.animation = '';
			leaf.style.animationDelay = '0s, ' + (-Math.random() * 2).toFixed(2) + 's';
		}

		function renderScore(bump) {
			scoreEl.textContent = score;
			comboEl.textContent = 'x' + combo;
			if (bump && !reduce) gsap.fromTo([scoreEl, comboEl], { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
		}

		function popScore(x, y, n) {
			var pop = document.createElement('span');
			pop.className = 'score-pop';
			pop.style.left = x + '%';
			pop.style.top = y + '%';
			pop.innerHTML = '+' + n + (n > 1 ? '<small>COMBO x' + n + '</small>' : '');
			target.appendChild(pop);
			if (reduce) { setTimeout(pop.remove.bind(pop), 900); return; }
			gsap.fromTo(pop, { y: 0, scale: 0.6, opacity: 1 }, {
				y: -90, scale: 1, opacity: 0, duration: 1.1, ease: 'power2.out',
				onComplete: pop.remove.bind(pop)
			});
		}

		function dropAxe(axe) {
			if (reduce) { axe.remove(); return; }
			gsap.to(axe, {
				y: '+=' + target.offsetHeight * 0.7, rotate: '+=' + gsap.utils.random(70, 140), opacity: 0,
				duration: 0.6, ease: 'power2.in', overwrite: true,
				onComplete: axe.remove.bind(axe)
			});
		}
	}

	/* ----------------------------------------------------------------------
	   12. Toulouse: sunbeam catcher mini-game
	   The brick is played with the mouse only: one click grabs it, another drops it.
	   Each caught sunbeam scores 1 point + a combo bonus; a missed one resets the combo.
	   The game only runs while the Toulouse step is on screen.
	   ---------------------------------------------------------------------- */
	function sunCatcher() {
		var panel = $('.panel--sun');
		var canvas = $('.sunrays', panel), brick = $('.brick-catcher', panel);
		var scoreEl = $('.sun-score', panel), comboEl = $('.sun-combo', panel);
		var ctx = canvas.getContext('2d');
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		var W = 0, H = 0, rays = [], running = false, last = 0, nextSpawn = 0;
		var bx = 0, target = 0, score = 0, combo = 0;

		function size() {
			W = panel.offsetWidth; H = panel.offsetHeight;
			canvas.width = W * dpr; canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (!bx) bx = target = W * 0.5;
		}
		size();
		window.addEventListener('resize', size);

		// The brick is grabbed with the mouse: one click picks it up and it follows the pointer,
		// another click drops it. A long press (or a drag) drops it on release.
		var grabbed = false, pressing = false, pressStart = 0, pressMoved = 0, lastPX = 0, grabOffset = 0;
		var LONG_PRESS = 280;
		function pointerX(e) {
			var r = panel.getBoundingClientRect();
			return (e.clientX - r.left) * (W / r.width);
		}
		function setGrabbed(on) {
			grabbed = on;
			brick.classList.toggle('is-grabbed', on);
			brick.setAttribute('data-cursor', t(on ? 'game.drop' : 'game.grab'));
		}
		brick.addEventListener('pointerdown', function (e) {
			e.preventDefault();
			if (grabbed) { setGrabbed(false); return; }
			setGrabbed(true);
			grabOffset = pointerX(e) - bx;
			pressing = true; pressStart = performance.now(); pressMoved = 0; lastPX = e.clientX;
		});
		// Clicking anywhere else while holding the brick drops it too
		window.addEventListener('pointerdown', function (e) {
			if (grabbed && e.target !== brick) setGrabbed(false);
		});
		window.addEventListener('pointermove', function (e) {
			if (!grabbed) return;
			target = pointerX(e) - grabOffset;
			if (pressing) { pressMoved += Math.abs(e.clientX - lastPX); lastPX = e.clientX; }
		});
		window.addEventListener('pointerup', function () {
			if (!pressing) return;
			pressing = false;
			if (grabbed && (performance.now() - pressStart > LONG_PRESS || pressMoved > 12)) setGrabbed(false);
		});
		// On touch screens, dragging a finger anywhere on the step also moves the brick
		panel.addEventListener('pointermove', function (e) {
			if (e.pointerType === 'touch' && !grabbed) target = pointerX(e);
		});

		function render() {
			scoreEl.textContent = score;
			comboEl.textContent = 'x' + combo;
		}

		function caught(ray) {
			combo += 1;
			score += combo; // 1 point + combo bonus for each consecutive catch
			render();
			gsap.fromTo([scoreEl, comboEl], { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
			brick.classList.add('is-catching');
			setTimeout(function () { brick.classList.remove('is-catching'); }, 220);
			var pop = document.createElement('span');
			pop.className = 'score-pop';
			pop.style.left = (ray.x / W * 100) + '%';
			pop.style.top = (brick.offsetTop / H * 100) + '%';
			pop.innerHTML = '+' + combo + (combo > 1 ? '<small>COMBO x' + combo + '</small>' : '');
			panel.appendChild(pop);
			gsap.fromTo(pop, { y: 0, scale: 0.6, opacity: 1 }, { y: -110, scale: 1, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: pop.remove.bind(pop) });
		}

		function missed() {
			if (combo === 0) return;
			combo = 0;
			render();
			gsap.fromTo(comboEl, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, .3)' });
		}

		function drawRay(r) {
			// A sunbeam: an elongated golden shard, slightly tilted, with a glowing trail
			ctx.save();
			ctx.translate(r.x, r.y);
			ctx.rotate(-0.22);
			var trail = ctx.createLinearGradient(0, -r.len * 2.2, 0, 0);
			trail.addColorStop(0, 'rgba(255, 236, 170, 0)');
			trail.addColorStop(1, 'rgba(255, 236, 170, .55)');
			ctx.fillStyle = trail;
			ctx.fillRect(-r.w * 0.35, -r.len * 2.2, r.w * 0.7, r.len * 2.2);
			ctx.shadowColor = 'rgba(255, 210, 90, .95)';
			ctx.shadowBlur = 18;
			ctx.fillStyle = '#fff3c4';
			ctx.beginPath();
			ctx.moveTo(0, -r.len); ctx.lineTo(r.w, 0); ctx.lineTo(0, r.len * 0.45); ctx.lineTo(-r.w, 0);
			ctx.closePath(); ctx.fill();
			ctx.shadowBlur = 0;
			ctx.lineWidth = 2.5; ctx.strokeStyle = '#e8762f'; ctx.stroke();
			ctx.restore();
		}

		function frame(now) {
			if (!running) return;
			var dt = Math.min(0.05, (now - (last || now)) / 1000);
			last = now;

			var half = brick.offsetWidth / 2;
			target = Math.max(half, Math.min(W - half, target));
			bx += (target - bx) * Math.min(1, dt * 18);
			brick.style.transform = 'translateX(' + (bx - half).toFixed(1) + 'px)';

			// More and faster sunbeams as the combo grows
			var pace = 1 + Math.min(combo, 30) * 0.035;
			if (now >= nextSpawn) {
				rays.push({ x: W * 0.06 + Math.random() * W * 0.88, y: -40, v: (170 + Math.random() * 90) * pace, len: 40 + Math.random() * 18, w: 11 + Math.random() * 4 });
				nextSpawn = now + (650 + Math.random() * 600) / pace;
			}

			var top = brick.offsetTop, bottom = top + brick.offsetHeight;
			ctx.clearRect(0, 0, W, H);
			for (var i = rays.length - 1; i >= 0; i--) {
				var r = rays[i];
				r.y += r.v * dt;
				if (r.y >= top && r.y <= bottom && Math.abs(r.x - bx) <= half + r.w) {
					rays.splice(i, 1); caught(r); continue;
				}
				if (r.y > bottom + 20) { rays.splice(i, 1); missed(); continue; }
				drawRay(r);
			}
			requestAnimationFrame(frame);
		}

		// Only play while the Toulouse step is actually on screen
		new IntersectionObserver(function (en) {
			var visible = en[0].intersectionRatio >= 0.6;
			if (visible && !running) {
				running = true; last = 0; nextSpawn = performance.now() + 600;
				requestAnimationFrame(frame);
			} else if (!visible && running) {
				running = false; rays = [];
				if (grabbed) setGrabbed(false);
				ctx.clearRect(0, 0, W, H);
			}
		}, { threshold: [0, 0.6, 1] }).observe(panel);

		render();
	}

	/* ----------------------------------------------------------------------
	   13. Code: the CRT-head man looks at the cursor
	   ---------------------------------------------------------------------- */
	function crtHead() {
		var man = $('.crt-man');
		if (!man) return;
		var head = $('.crt-head', man), face = $('.crt-face', man), gaze = $('.crt-gaze', man);
		var sideH = $('.crt-side-h', man), sideV = $('.crt-side-v', man);

		// Front face of the monitor box, in SVG units, and how far each layer moves
		// with the gaze: the face slides towards the cursor, the back of the box the
		// other way (revealing a side), and the screen content further, like eyes.
		var X0 = 110, Y0 = 40, X1 = 292, Y1 = 192;
		var FACE = [9, 6], BACK = [-24, -16], GAZE = [12, 8];
		var IDLE = { x: -0.6, y: 0.5 }; // resting pose, also used without a mouse
		var look = { x: IDLE.x, y: IDLE.y }, aim = { x: IDLE.x, y: IDLE.y }, visible = false;

		function quad(ax, ay, bx, by, cx, cy, dx, dy) {
			return 'M' + [ax, ay, 'L' + bx, by, 'L' + cx, cy, 'L' + dx, dy].map(function (v) {
				return typeof v === 'number' ? v.toFixed(1) : v;
			}).join(' ') + ' Z';
		}
		function render() {
			var fx = look.x * FACE[0], fy = look.y * FACE[1];
			var bx = look.x * BACK[0], by = look.y * BACK[1];
			// The side the back of the box moves towards becomes visible
			var x = bx < fx ? X0 : X1, y = by < fy ? Y0 : Y1;
			sideH.setAttribute('d', quad(x + fx, Y0 + fy, x + bx, Y0 + by, x + bx, Y1 + by, x + fx, Y1 + fy));
			sideV.setAttribute('d', quad(X0 + fx, y + fy, X1 + fx, y + fy, X1 + bx, y + by, X0 + bx, y + by));
			face.setAttribute('transform', 'translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ')');
			gaze.setAttribute('transform', 'translate(' + (look.x * GAZE[0]).toFixed(1) + ' ' + (look.y * GAZE[1]).toFixed(1) + ')');
			gsap.set(head, { rotation: look.x * 3 });
		}

		gsap.set(head, { svgOrigin: '200 210' }); // the head pivots on the neck
		new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(man);

		// Gaze direction: from the screen centre to the cursor, normalised to [-1, 1]
		window.addEventListener('pointermove', function (e) {
			if (e.pointerType !== 'mouse') return;
			var r = face.getBoundingClientRect();
			aim.x = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.35));
			aim.y = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (innerHeight * 0.35));
		}, { passive: true });
		document.addEventListener('mouseleave', function () { aim.x = IDLE.x; aim.y = IDLE.y; });

		gsap.ticker.add(function () {
			// While being electrocuted, he stops looking at the cursor
			if (!visible || man.classList.contains('is-busy')) return;
			if (Math.abs(aim.x - look.x) + Math.abs(aim.y - look.y) < 0.002) return;
			look.x += (aim.x - look.x) * 0.12;
			look.y += (aim.y - look.y) * 0.12;
			render();
		});
	}

	/* ----------------------------------------------------------------------
	   14. Code: CRT man easter egg
	   Grab the plug at the end of the cable (click to grab, click again to drop,
	   a long press drops it on release): a wall socket appears. Plugging it in
	   electrocutes him… then he reboots, good as new.
	   ---------------------------------------------------------------------- */
	function crtEasterEgg() {
		var man = $('.crt-man');
		if (!man) return;
		var cable = $('.crt-cable', man), plug = $('.crt-plug-g', man), hit = $('.crt-plug-hit', man);
		var socket = $('.crt-socket', man), bolts = $('.crt-bolts', man);
		var head = $('.crt-head', man), body = $('.crt-body', man);
		var text = $('.crt-text', man), caret = $('.crt-cursor', man), off = $('.crt-off', man);
		var bootUi = $('.crt-bootui', man), bar = $('.crt-bar', man);
		gsap.set(head, { svgOrigin: '200 210' });

		var REST = { x: 366, y: 613 };            // plug lying on the floor
		var SOCKET = { x: 52, y: 505 };           // plug in the socket (prongs in the holes)
		var CABLE_REST = cable.getAttribute('d');
		var coarse = window.matchMedia('(pointer: coarse)').matches;
		var SNAP = coarse ? 34 : 20, LONG_PRESS = 280;
		if (coarse) hit.setAttribute('r', '44'); // larger grab area for fingers
		var plugPos = { x: REST.x, y: REST.y };
		var grabbed = false, pressing = false, pressStart = 0, pressMoved = 0, busy = false;

		function toSvg(e) {
			var pt = man.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
			return pt.matrixTransform(man.getScreenCTM().inverse());
		}
		function setPlug(p, restCable) {
			plugPos.x = p.x; plugPos.y = p.y;
			plug.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
			hit.setAttribute('cx', p.x.toFixed(1)); hit.setAttribute('cy', p.y.toFixed(1));
			if (restCable) { cable.setAttribute('d', CABLE_REST); return; }
			// The cable hangs between the screen and the plug
			var sag = Math.max(p.y, 150) + 90;
			cable.setAttribute('d', 'M318 150 C358 172 ' + ((318 + p.x) / 2 + 24).toFixed(1) + ' ' + sag.toFixed(1) + ' ' + p.x.toFixed(1) + ' ' + (p.y - 7).toFixed(1));
		}
		function nearSocket(p) { return Math.hypot(p.x - SOCKET.x, p.y - SOCKET.y) < SNAP; }

		function grab(e) {
			grabbed = true;
			man.classList.add('is-busy');
			gsap.to(socket, { opacity: 1, duration: 0.3 });
			gsap.fromTo(socket, { scale: 0.5 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)', transformOrigin: '50% 50%' });
			setPlug(toSvg(e));
		}
		function drop() {
			grabbed = false;
			var from = { x: plugPos.x, y: plugPos.y };
			gsap.to(from, { x: REST.x, y: REST.y, duration: 0.7, ease: 'bounce.out', onUpdate: function () { setPlug(from); }, onComplete: function () { setPlug(REST, true); man.classList.remove('is-busy'); } });
			gsap.to(socket, { opacity: 0, duration: 0.4 });
		}

		// Mobile: grabbing or holding the plug must not scroll the page
		hit.addEventListener('touchstart', function (e) { if (!busy) e.preventDefault(); }, { passive: false });
		window.addEventListener('touchmove', function (e) { if (grabbed) e.preventDefault(); }, { passive: false });

		hit.addEventListener('pointerdown', function (e) {
			if (busy) return;
			e.preventDefault();
			if (grabbed) { drop(); return; }
			grab(e);
			pressing = true; pressStart = performance.now(); pressMoved = 0;
		});
		window.addEventListener('pointerdown', function (e) {
			if (grabbed && e.target !== hit) drop();
		});
		window.addEventListener('pointermove', function (e) {
			if (!grabbed) return;
			var p = toSvg(e);
			if (pressing) pressMoved += Math.hypot(p.x - plugPos.x, p.y - plugPos.y);
			setPlug(p);
			if (nearSocket(p)) electrocute();
		});
		window.addEventListener('pointerup', function () {
			if (!pressing) return;
			pressing = false;
			if (grabbed && (performance.now() - pressStart > LONG_PRESS || pressMoved > 12)) drop();
		});

		function smoke() {
			for (var i = 0; i < 6; i++) {
				var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				c.setAttribute('class', 'crt-smoke');
				c.setAttribute('cx', 170 + Math.random() * 90); c.setAttribute('cy', 30);
				c.setAttribute('r', 8 + Math.random() * 8);
				man.appendChild(c);
				gsap.fromTo(c, { y: 0, opacity: 0.7, scale: 0.6 }, {
					y: -90 - Math.random() * 60, x: gsap.utils.random(-30, 30), opacity: 0, scale: 1.8,
					duration: 1.6, delay: i * 0.12, ease: 'power1.out', transformOrigin: '50% 50%',
					onComplete: c.remove.bind(c)
				});
			}
		}

		function electrocute() {
			grabbed = false; pressing = false; busy = true;
			setPlug(SOCKET);
			var jitter = [head, body];
			gsap.timeline({
				onComplete: function () {
					busy = false;
					man.classList.remove('is-busy');
				}
			})
				// 1. Current flows: lightning, inverted image, shaking, scrambled screen
				.add(function () { man.classList.add('is-zapped'); text.textContent = '#%!@?'; })
				.set(bolts, { opacity: 1 })
				.to(bolts, { opacity: 0.15, duration: 0.05, repeat: 21, yoyo: true }, '<')
				.to(jitter, { x: 'random(-7, 7)', y: 'random(-5, 5)', duration: 0.045, repeat: 24, repeatRefresh: true, yoyo: true }, '<')
				.add(function () { text.textContent = '!@#$%'; }, 0.4)
				.add(function () { text.textContent = '?!%#&'; }, 0.8)
				// 2. Short circuit: the screen switches off like an old tube, he slumps, smoke rises
				.add(function () { man.classList.remove('is-zapped'); text.style.visibility = 'hidden'; caret.style.visibility = 'hidden'; }, 1.15)
				.set(bolts, { opacity: 0 }, 1.15)
				.set(jitter, { x: 0, y: 0 }, 1.15)
				.fromTo(off, { opacity: 1, scaleY: 1, scaleX: 1, svgOrigin: '200 110' }, { scaleY: 0.04, duration: 0.18, ease: 'power2.in' }, 1.15)
				.to(off, { scaleX: 0.04, duration: 0.16, ease: 'power2.in' })
				.to(off, { opacity: 0, duration: 0.2 })
				.to(head, { rotation: 16, y: 10, duration: 0.5, ease: 'power2.out' }, 1.3)
				.to(body, { y: 8, duration: 0.5, ease: 'power2.out' }, 1.3)
				.add(smoke, 1.5)
				// 3. The plug pops out of the wall and falls back, the socket fades away
				.add(function () {
					var from = { x: SOCKET.x, y: SOCKET.y };
					gsap.timeline()
						.to(from, { x: SOCKET.x + 40, y: SOCKET.y - 50, duration: 0.25, ease: 'power2.out', onUpdate: function () { setPlug(from); } })
						.to(from, { x: REST.x, y: REST.y, duration: 0.8, ease: 'bounce.out', onUpdate: function () { setPlug(from); }, onComplete: function () { setPlug(REST, true); } });
					gsap.to(socket, { opacity: 0, duration: 0.5, delay: 0.3 });
				}, 2.4)
				// 4. Reboot: BOOT screen, progress bar, he stands back up
				.set(bar, { attr: { width: 0 } }, 3)
				.to(bootUi, { opacity: 1, duration: 0.2 }, 3)
				.to(bar, { attr: { width: 96 }, duration: 1.1, ease: 'steps(12)' }, 3.1)
				.to(head, { rotation: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }, 3.4)
				.to(body, { y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }, 3.4)
				.to(bootUi, { opacity: 0, duration: 0.2 }, 4.3)
				.add(function () { text.textContent = '{ C# }'; text.style.visibility = ''; caret.style.visibility = ''; }, 4.45);
		}
	}

	/* ----------------------------------------------------------------------
	   15. Scroll choreography
	   ---------------------------------------------------------------------- */
	function scrollScenes(lenis) {
		var hudNum = $('#hud-num'), hudLabel = $('#hud-label');
		function setChapter(el) {
			hudNum.textContent = el.getAttribute('data-chapter');
			hudLabel.textContent = el.getAttribute('data-chapter-label');
		}

		gsap.to('#hud-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

		// Hero: exit parallax
		gsap.to('.hero__portrait', { yPercent: -30, rotate: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
		gsap.to('.hero__line', { xPercent: function (i) { return i ? 12 : -12; }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
		$$('[data-float]').forEach(function (el) {
			var f = parseFloat(el.getAttribute('data-float'));
			gsap.to(el, { y: f * 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
		});

		var mm = gsap.matchMedia();

		// Manifesto: words light up one by one
		var words = $$('.manifesto__text .w');
		var swatches = $$('.swatch');
		var swatchFrom = { yPercent: 70, opacity: 0, rotate: function (i) { return [-28, 24, -18][i]; }, ease: 'back.out(1.4)' };
		mm.add('(min-width: 901px)', function () {
			var tl = gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=140%', pin: true, scrub: 0.6 } })
				.to(words, { opacity: 1, stagger: 0.1, ease: 'none' })
				.from('.manifesto .chip', { rotate: function (i) { return [-12, 9, -7][i % 3]; }, scale: 0.6, stagger: 0.3, ease: 'back.out(3)' }, 0.2);
			// Metal, wood, code: each swatch lands as its word is read
			var total = words.length * 0.1;
			swatches.forEach(function (sw, i) {
				tl.from(sw, Object.assign({}, swatchFrom, { rotate: swatchFrom.rotate(i), duration: total * 0.18 }), total * [0.08, 0.22, 0.62][i]);
			});
		});
		mm.add('(max-width: 900px)', function () {
			gsap.to(words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
			gsap.from(swatches, Object.assign({}, swatchFrom, { stagger: 0.15, duration: 1, scrollTrigger: { trigger: '.swatches', start: 'top 80%' } }));
		});

		// Story: horizontal scroll
		var track = $('.story__track');
		var panels = $$('.panel');
		mm.add('(min-width: 901px)', function () {
			var dist = function () { return track.scrollWidth - innerWidth; };
			var h = gsap.to(track, {
				x: function () { return -dist(); }, ease: 'none',
				scrollTrigger: { trigger: '.story', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: true, invalidateOnRefresh: true }
			});
			var unsnap = lenis ? pagedPanels(lenis, h.scrollTrigger, panels.length) : null;
			// Reveal trigger for a step. Step 01 is already in place when the story reaches the screen,
			// so a horizontal trigger would already be passed: it is revealed on vertical arrival instead.
			function reveal(p, i, start) {
				return i === 0
					? { trigger: '.story', start: 'top 55%', toggleActions: 'play none none reverse' }
					: { containerAnimation: h, trigger: p, start: start, toggleActions: 'play none none reverse' };
			}
			var hst = h.scrollTrigger;
			panels.forEach(function (p, i) {
				var ca = { containerAnimation: h, trigger: p };
				gsap.fromTo($('.panel__num', p), { xPercent: 35 }, { xPercent: -35, ease: 'none', scrollTrigger: Object.assign({ start: 'left right', end: 'right left', scrub: true }, ca) });
				gsap.from($$('.panel__body > *', p), { y: 90, opacity: 0, rotate: 3, stagger: 0.12, duration: 1, ease: 'power4.out', scrollTrigger: reveal(p, i, 'left 60%') });
				var st = $$('.panel__sticker', p);
				if (st.length) gsap.from(st, { scale: 0, rotate: -40, duration: 0.9, stagger: 0.25, ease: 'back.out(2.5)', delay: i === 0 ? 0.4 : 0, scrollTrigger: reveal(p, i, 'left 40%') });
				var art = $('.panel__art', p);
				if (art) gsap.from(art, { scale: 0.4, rotate: -25, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', delay: i === 0 ? 0.2 : 0, scrollTrigger: reveal(p, i, 'left 45%') });
				// Chapter indicator: for step 01, from entering the story to halfway to step 02
				if (i === 0) ScrollTrigger.create({ trigger: '.story', start: 'top center', end: function () { return hst.start + (hst.end - hst.start) / (panels.length - 1) / 2; }, onToggle: function (s) { if (s.isActive) setChapter(p); } });
				else ScrollTrigger.create(Object.assign({ start: 'left center', end: 'right center', onToggle: function (s) { if (s.isActive) setChapter(p); } }, ca));
			});
			var rings = $$('.art-wood .rings ellipse, .art-wood .crack');
			rings.forEach(function (r) { r.setAttribute('pathLength', '1'); });
			gsap.fromTo(rings, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.08, ease: 'none', scrollTrigger: { containerAnimation: h, trigger: '.panel--wood', start: 'left 70%', end: 'left 5%', scrub: true } });
			// The caribou walks across the snowbank as the panel scrolls
			gsap.fromTo('.caribou', { x: '22vw' }, { x: '-26vw', ease: 'none', scrollTrigger: { containerAnimation: h, trigger: '.panel--wood', start: 'left right', end: 'right left', scrub: true } });
			gsap.from('.crt-man', { yPercent: 35, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { containerAnimation: h, trigger: '.panel--code', start: 'left 55%', toggleActions: 'play none none reverse' } });
			gsap.fromTo('.sun', { rotate: -60, scale: 0.6 }, { rotate: 40, scale: 1, ease: 'none', scrollTrigger: { containerAnimation: h, trigger: '.panel--sun', start: 'left right', end: 'right left', scrub: true } });
			return function () { if (unsnap) unsnap(); };
		});
		mm.add('(max-width: 900px)', function () {
			panels.forEach(function (p) {
				gsap.from($$('.panel__body > *', p), { y: 60, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 65%' } });
				ScrollTrigger.create({ trigger: p, start: 'top center', end: 'bottom center', onToggle: function (s) { if (s.isActive) setChapter(p); } });
			});
		});

		// Vertical chapters for the HUD
		$$('[data-chapter]').forEach(function (el) {
			if (el.classList.contains('panel')) return;
			ScrollTrigger.create({ trigger: el, start: 'top center', end: 'bottom center', onToggle: function (s) { if (s.isActive) setChapter(el); } });
		});

		// Big titles
		$$('.work__title span, .stack__title, .human__title, .contact__title > *').forEach(function (el) {
			gsap.from(el, { yPercent: 60, opacity: 0, rotate: 2.5, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
		});

		// Stacking cards
		var cards = $$('.card');
		// A card taller than the viewport sticks higher, so its bottom (the truck lane) stays visible
		function stickCards() {
			cards.forEach(function (card) {
				card.style.top = Math.min(innerHeight * 0.12, innerHeight - card.offsetHeight - 24) + 'px';
			});
		}
		stickCards();
		window.addEventListener('resize', stickCards);
		cards.forEach(function (card, i) {
			var next = cards[i + 1];
			if (!next) return;
			gsap.to(card, {
				scale: 0.9, rotate: i % 2 ? 2.5 : -2.5, transformOrigin: '50% 0', ease: 'none',
				scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true }
			});
		});
		gsap.from('.card__art--docs i', { y: 200, rotate: 30, stagger: 0.1, duration: 1.1, ease: 'back.out(1.6)', clearProps: 'transform', scrollTrigger: { trigger: '.card--illinks', start: 'top 60%' } });

		// Hobbies: deal the cards
		gsap.from('.hobby', {
			y: 260, rotate: function (i) { return [-25, 18, -12, 22][i]; }, opacity: 0, stagger: 0.12, duration: 1.3, ease: 'power4.out',
			clearProps: 'transform,opacity', scrollTrigger: { trigger: '.hobbies', start: 'top 85%' }
		});

		// Contact
		gsap.from('.contact__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
		gsap.from('.field, .form__foot, .links li', { y: 40, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.form', start: 'top 85%' } });

		// Footer: bouncing CARDIN letters
		var giant = $$('.footer__giant .ch');
		gsap.from(giant, { yPercent: 110, rotate: function () { return gsap.utils.random(-25, 25); }, stagger: 0.06, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
		giant.forEach(function (ch) {
			ch.addEventListener('pointerenter', function () {
				gsap.fromTo(ch, { y: 0 }, { y: '-18%', rotate: gsap.utils.random(-12, 12), duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true });
			});
		});

		// Anchor links
		$$('a[href^="#"]').forEach(function (a) {
			a.addEventListener('click', function (e) {
				var id = a.getAttribute('href');
				var target = id === '#top' ? 0 : $(id);
				if (target === null) return;
				e.preventDefault();
				lenis ? lenis.scrollTo(target, { duration: 1.6 }) : window.scrollTo({ top: target ? target.getBoundingClientRect().top + scrollY : 0 });
				// Move keyboard focus along with the scroll (skip link, in-page navigation)
				if (target && target.focus) target.focus({ preventScroll: true });
			});
		});
	}

	/* ----------------------------------------------------------------------
	   16. Loader and hero intro
	   ---------------------------------------------------------------------- */
	function intro(lenis) {
		var loader = $('#loader');
		var returning = html.classList.contains('is-returning');
		var heroLetters = $$('.hero__title .ch');
		var stickers = $$('.hero .sticker');

		gsap.set(heroLetters, { yPercent: 115, rotate: function () { return gsap.utils.random(-30, 30); } });
		gsap.set('.hero__portrait', { scale: 0.4, rotate: -30, opacity: 0 });
		gsap.set(stickers, { scale: 0 });
		gsap.set('.hero__intro, .hero__scroll, .hero__meta, .nav, .hud', { opacity: 0, y: 30 });

		var switched = store('session', 'ac-switch');
		store('session', 'ac-switch', null);
		store('session', 'ac-seen', '1');
		if (lenis) lenis.stop();

		var tl = gsap.timeline();
		if (switched) {
			loader.style.display = 'none';
			var curtain = $('#curtain');
			gsap.set(curtain, { y: 0, yPercent: 0 });
			tl.to(curtain, { yPercent: -101, duration: 0.8, ease: 'power4.inOut' });
		} else {
			var counter = { v: 0 }, out = $('#loader-count'), bar = $('#loader-bar');
			var words = $$('.loader__words span');
			var dur = returning ? 0.6 : 2;
			tl.to(counter, {
				v: 100, duration: dur, ease: 'power2.inOut',
				onUpdate: function () {
					out.textContent = String(Math.round(counter.v)).padStart(3, '0');
					bar.style.width = counter.v + '%';
					var idx = Math.min(words.length - 1, Math.floor(counter.v / (100 / words.length)));
					words.forEach(function (w, i) { w.style.opacity = i === idx ? 1 : 0; });
				}
			});
			tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut' }, '+=0.15');
			tl.set(loader, { display: 'none' });
		}

		tl.to(heroLetters, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.035, ease: 'power4.out' }, '-=0.45')
			.to('.hero__portrait', { scale: 1, rotate: 0, opacity: 1, duration: 1.4, ease: 'elastic.out(1, .6)' }, '<0.2')
			.to(stickers, { scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(3)' }, '<0.4')
			.to('.hero__intro, .hero__scroll, .hero__meta, .nav, .hud', { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }, '<0.1')
			.add(function () { if (lenis) lenis.start(); });

		// Stickers follow the mouse
		if (finePointer) {
			$$('[data-float]').forEach(function (el) {
				var f = parseFloat(el.getAttribute('data-float')) / 30;
				var xTo = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' });
				window.addEventListener('pointermove', function (e) { xTo((e.clientX / innerWidth - 0.5) * 60 * f); }, { passive: true });
			});
		}
	}

	/* ----------------------------------------------------------------------
	   Bootstrap
	   ---------------------------------------------------------------------- */
	applyLanguage();
	clock();
	contactForm();

	if (!hasGsap) { $('#loader').style.display = 'none'; return; }

	gsap.registerPlugin(ScrollTrigger);
	$$('[data-split-letters]').forEach(splitLetters);
	$$('[data-scrub-words]').forEach(splitWords);

	axeThrowing();
	crtEasterEgg();
	var weld = weldingGame();

	if (reduce) {
		$('#loader').style.display = 'none';
		store('session', 'ac-switch', null);
		return;
	}

	var lenis = null;
	if (window.Lenis) {
		lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
		gsap.ticker.lagSmoothing(0);
	}

	if (finePointer) { cursor(); magnetic(); breathingTitle(); crtHead(); }
	marquees(function () { return lenis ? lenis.velocity : 0; });
	sparks(weld);
	sunCatcher();
	scrollScenes(lenis);
	intro(lenis);

	if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
	window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
