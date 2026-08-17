# Own the CSS; donor is reference only

The storefront imported a 260 KB minified Van Morrison concert-site stylesheet.
Shop pages inherited heading color `#0f0f0f` on a `#0f0f0f` body, plus unused
rules for tickets, cookie banners, and albums. We keep the look, rewrite only
the classes the Vue app actually uses, and never import `vm.css`.
`vanmorrison/` stays as a visual reference.

**Considered:** namespacing the donor (still unreadable); scoped styles per SFC
(chrome would drift).
