const workspace = document.getElementById("workspace");
const form = document.getElementById("form");
const linkDiv = document.getElementById("form-link-div");
const formLinks =[];
const linksDisplay = document.getElementById("links-display");
const topics = new Set();
topics.add("")
const topicSelect = document.querySelector("#topic-select");

// Creates an element with a class and textContent
function simpleElement(type,className,text="") {
    const element = document.createElement(type);
    element.className = className;
    element.textContent = text;
    return element;
}
// Creates a class responsible for managing the creation of cards
class NoteCard {
    // Makes an object for the card
    constructor(id,topic,summary,content,links){
        this.topic = topic;

        this.div = document.createElement("div");
        this.div.className = ("note-card");
        if(this.topic !== "") this.div.classList.add(topic);
        this.div.id = id; 

        this.h2 = simpleElement("h2","note-summary",summary);
        this.p = simpleElement("p","note-content",content);
        this.section = simpleElement("section","note-links-list");
        this.button = simpleElement("button","delete-card","X");

        this.aList = links.map(link => {
            const a = simpleElement("a","note-link",link[0]);
            a.href = link[1];
            return a;
        })
    }
    // Adds the object to the location provided, calls to addTopic
    displayCard(location){
        this.aList.forEach(link => {
            this.section.append(link);
            this.section.append(document.createElement("br"));
        });
        this.div.append(this.h2,this.p,this.section,this.button);
        location.append(this.div);
        addTopic(this.topic);
    }
}
// Adds a topic to the select dropdown
function addTopic(topic) {
    if (!topics.has(topic)) {
        topics.add(topic)
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicSelect.append(option);
    }
}
// Sends a request to the json file and adds the new card
form.addEventListener("submit",event =>{
    event.preventDefault();
    console.log("Links:");
    console.log(formLinks);
    fetch("http://localhost:3000/cards",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            topic: form.querySelector("#form-topic").value,
            summary: form.querySelector("#form-summary").value,
            content: form.querySelector("#form-content").value,
            links: formLinks
        })
    })
    .then(response => response.json())
    .then(card => {
        console.log(card);
        console.log(card.links);
        const newCard = new NoteCard(card.id,card.topic,card.summary,card.content,card.links);
        newCard.displayCard(workspace);

        formLinks.length = 0;
        while (linksDisplay.firstChild) {
            linksDisplay.removeChild(linksDisplay.firstChild);
        }
            form.querySelector("#form-topic").value="";
            form.querySelector("#form-summary").value="";
            form.querySelector("#form-content").value="";
        })
    .catch(error => console.log(error))
})
// Adds a link to the list
linkDiv.addEventListener("submit",event =>{
    event.preventDefault();
    const linkText = linkDiv.querySelector("#link-text");
    const linkUrl = linkDiv.querySelector("#link-url")
    formLinks.push([[linkText.value],[linkUrl.value]])

    if(formLinks.length>0) linkDiv.querySelector(".delete").disabled = false;

    const li = document.createElement("li");
    const p0 = simpleElement("p","",linkText.value)
    const p1 = simpleElement("p","",linkUrl.value)
    li.append(p0,p1);
    linksDisplay.append(li);

    linkText.value = "";
    linkUrl.value = "";
})
// Removes a link from the list
linkDiv.addEventListener("click",event=>{
    if(event.target.className === "delete"){
        formLinks.pop();
        if(formLinks.length===0) linkDiv.querySelector(".delete").disabled = true;
        linksDisplay.lastChild.remove();
    }
})
// Highlights a segment of text
document.addEventListener("keypress", event => {
    if(event.target.className !== "restrict-key" && event.key === "h"){
        const selection = document.getSelection();
        // If you have only one element in your selection
        if(selection.anchorNode === selection.focusNode){
            // Replaces your selection with a span with the class highlight
            const range = selection.getRangeAt(0);
            const span = simpleElement("span","highlight",getSelection().toString())
            selection.deleteFromDocument()
            range.insertNode(span)
        }
    }
})
// Removes all highlights from the text, and manages deleting cards
workspace.addEventListener("click",event =>{
    // First if is for clicking on highlighted text to remove it
    if(event.target.className==="highlight"){
        const textBox = event.target.parentNode;
        // Removes all highlight spans from whatever text was clicked
        const text = Array.from(textBox.childNodes).reduce((acc,element) => acc + element.textContent,"")
        event.target.remove();
        textBox.textContent = text;
    }
    // Second if is for the delete buttons on the cards
    else if(event.target.className === "delete-card"){
        console.log(event.target.parentNode.id);
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .catch(error => console.log(error))
        event.target.parentNode.remove();
    }
})
// Filters cards by topic
topicSelect.addEventListener("change", event=> {
    const filter = event.target.value;
    Array.from(workspace.querySelectorAll(".note-card")).forEach(element => {
        if(Array.from(element.classList).includes(filter) || filter === ""){
            element.hidden = false;
        } else{
            element.hidden = true;
        }
    });
})

// Gets cards on page load
fetch("http://localhost:3000/cards")
.then(response => response.json())
.then(cards => {
    cards.forEach(card => {
        const newCard = new NoteCard(card.id,card.topic,card.summary,card.content,card.links);
        newCard.displayCard(workspace);
    });
})
.catch(error => console.log(error))