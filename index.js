const workspace = document.getElementById("workspace");

class NoteCard {
    constructor(id,topic,summary,content,links){
        this.div = document.createElement("div");
        this.div.classList.add("note-card",topic);
        this.div.id = id;

        this.h2 = document.createElement("h2");
        this.h2.className = "note-summary"
        this.h2.textContent = summary;

        this.p = document.createElement("p");
        this.p.className = "note-content"
        this.p.textContent = content

        this.section = document.createElement("section");
        this.section.className = "note-links-list";

        this.aList = links.map(link => {
            const a = document.createElement("a");
            a.href = link[1];
            a.textContent = link[0];
            a.className = "note-link";
            return a;
        })
    }
    displayCard(location){
        this.aList.forEach(link => {
            this.section.append(link);
            this.section.append(document.createElement("br"));
        });
        this.div.append(this.h2,this.p,this.section);
        location.append(this.div);
    }
}

const testCard = new NoteCard(1,"JavaScript","Objects",
"This is how to set up objects",
[[
    ["Semantic Elements Course"],
    ["https://learning.flatironschool.com/courses/7589/pages/html5-semantic-elements?module_item_id=670297"]
],
[
    ["MDN Div Reference"],
    ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div"],
],
[
    ["W3Schools Div Tutorial"],
    ["https://www.w3schools.com/html/html_div.asp"],
]
]);

console.log(testCard);
testCard.displayCard(workspace)