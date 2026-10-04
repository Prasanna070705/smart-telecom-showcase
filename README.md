# Smart Telecom Command Center: showcase

A one-page site presenting an Operations Research project: two optimisation engines on IBM's Telco churn data
(7,043 customers). Engine 1, a nonlinear program, sets the prices of ten services without letting churn rise;
Engine 2, a binary integer program, picks which at-risk customers to call with which retention offer.

The page is static (one `index.html`, no build step) and is served by GitHub Pages. The app's source code is in a
private repository; the demo video and screenshots in `media/` were recorded from the running app at its default
settings.

To preview locally: `python3 -m http.server 8000`, then open http://localhost:8000.
