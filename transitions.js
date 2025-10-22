document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', function(e){
            e.preventDefault();
            const href = this.getAttribute('href');
            document.body.style.transition = "opacity 0.8s";
            document.body.style.opacity = 0;
            setTimeout(() => {
                window.location.href = href;
            }, 800);
        });
    });

    document.body.style.opacity = 0;
    setTimeout(() => { document.body.style.transition = "opacity 0.8s"; document.body.style.opacity = 1; }, 100);
});
