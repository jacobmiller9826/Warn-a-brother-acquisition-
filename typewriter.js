document.addEventListener("DOMContentLoaded", function() {
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');

    if(title) typeWriter(title, 100);
    if(subtitle) typeWriter(subtitle, 50);

    function typeWriter(element, speed) {
        const text = element.innerText;
        element.innerText = '';
        let i = 0;

        function typing() {
            if(i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            }
        }
        typing();
    }
});
