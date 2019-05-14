$(function () {
    loadContent($("#content"), "main.html");
    $.get("structure.json")
            .done(loadMenu);
});

function loadMenu(data) {
    let nav = $("#menu")
    $.each(data.menu, function (index, value) {
        let li = $("<li>").addClass("nav-item");
        let a = $("<a>", {
            class: "menu-link nav-link active",
            href: "#",
            text: this.title
        })
                .attr("data", this.href);
        li.append(a);
        nav.append(li);
    });

    $(".menu-link").click(function () {
        let href = $(this).attr("data");
        loadContent($("#content"), href);
        
    })
    
    
}


function loadContent(container, href) {
        container.load("content/" + href, function () {
            var math = document.getElementById("content");
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
        });
    }
function ajaxError() {

}