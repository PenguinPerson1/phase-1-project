const workspace = document.getElementById("workspace");

function simpleElement(type,className,text="") {
    const element = document.createElement(type);
    element.className = className;
    element.textContent = text;
    return element;
}

class NoteCard {
    constructor(id,topic,summary,content,links){
        this.div = document.createElement("div");
        this.div.classList.add("note-card",topic);
        this.div.id = id; 

        this.h2 = simpleElement("h2","note-summary",summary);
        this.p = simpleElement("p","note-content",content);
        this.section = simpleElement("section","note-links-list");

        this.aList = links.map(link => {
            const a = simpleElement("a","note-link",link[0]);
            a.href = link[1];
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