fetch("/api/me")
    .then(res => res.json())
    .then(user => {

        if (!user) return;

        document.getElementById("auth-links").style.display = "none";

        const userLinks = document.getElementById("user-links");

        let html = `
            <a href="/profile.html">${user.first_name}</a>
        `;

        if (user.host) {
            html += `
                <a href="/host-dashboard.html">Host Dashboard</a>
            `;
        }

        html += `
            <a href="/logout">Logout</a>
        `;

        userLinks.innerHTML = html;
    });