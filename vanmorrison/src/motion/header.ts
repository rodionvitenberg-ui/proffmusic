import gsap from 'gsap'
import { prefersReducedMotion } from './reducedMotion'

export function animateNav(open: boolean, root: HTMLElement) {
  const left = root.querySelector<HTMLElement>('.site-nav__panel--left')
  const right = root.querySelector<HTMLElement>('.site-nav__panel--right')
  const items = root.querySelectorAll('.site-nav__item, .site-nav__secondary, .site-nav__vault')
  const reduced = prefersReducedMotion()

  if (open) {
    gsap.set(root, { autoAlpha: 1, visibility: 'visible' })
    if (reduced) {
      gsap.set([left, right], { x: 0, autoAlpha: 1 })
      gsap.set(items, { autoAlpha: 1, y: 0 })
      return
    }
    gsap.set(left, { x: '-100%' })
    gsap.set(right, { x: '100%' })
    gsap.set(items, { autoAlpha: 0, y: 16 })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(left, { x: '0%', duration: 0.55 }, 0)
    tl.to(right, { x: '0%', duration: 0.55 }, 0.05)
    tl.to(items, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0.2)
    return
  }

  if (reduced) {
    gsap.set(root, { autoAlpha: 0, visibility: 'hidden' })
    return
  }
  const tl = gsap.timeline({
    defaults: { ease: 'power3.in' },
    onComplete: () => {
      gsap.set(root, { autoAlpha: 0, visibility: 'hidden' })
    },
  })
  tl.to(items, { autoAlpha: 0, y: -10, duration: 0.2, stagger: 0.02 }, 0)
  tl.to(left, { x: '-100%', duration: 0.4 }, 0.05)
  tl.to(right, { x: '100%', duration: 0.4 }, 0.08)
}

export function animateSubscribe(open: boolean, root: HTMLElement) {
  const drawer = root.querySelector<HTMLElement>('.subscribe-panel__drawer')
  const reduced = prefersReducedMotion()

  if (open) {
    gsap.set(root, { autoAlpha: 1, visibility: 'visible' })
    if (reduced || !drawer) {
      gsap.set(drawer, { x: '0%' })
      return
    }
    gsap.set(drawer, { x: '100%' })
    gsap.to(drawer, { x: '0%', duration: 0.5, ease: 'power3.out' })
    return
  }

  if (reduced || !drawer) {
    gsap.set(root, { autoAlpha: 0, visibility: 'hidden' })
    return
  }
  gsap.to(drawer, {
    x: '100%',
    duration: 0.45,
    ease: 'power3.in',
    onComplete: () => gsap.set(root, { autoAlpha: 0, visibility: 'hidden' }),
  })
}
