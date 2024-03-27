const form = document.getElementById("form");
const linkDiv = document.getElementById("form-links");
const formLinks = [];
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
// Makes a card based on what type it is
function makeTypedCard(card){
    let newCard
    if (card.type === "text") {
        newCard = new TextCard(card.id,card.topic,card.summary,card.content,card.links);
    } else if(card.type === "image") {
        newCard = new ImageCard(card.id,card.topic,card.summary,card.content,card.links);
    }
    return newCard
}
// Creates a class responsible for managing the creation of cards
class NoteCard {
    // Makes an object for the card
    constructor(id,topic,summary,links){
        this.topic = topic;

        this.div = document.createElement("div");
        this.div.className = ("note-card");
        if(this.topic !== "") this.div.classList.add(topic);
        this.div.id = id; 

        this.h2 = simpleElement("h2","note-summary",summary);
        this.section = simpleElement("section","note-links-list");
        this.buttonDelete = simpleElement("button","delete-card","Delete");
        this.buttonEdit = simpleElement("button","edit-card","Edit");

        this.aList = links.map(link => {
            const a = simpleElement("a","note-link",link[0]);
            a.href = link[1];
            return a;
        })
    }
    // Adds the object to the location provided, calls to addTopic
    displayCard(content){
        const workspace = document.getElementById("workspace");
        this.aList.forEach(link => this.section.append(link));
        this.div.append(this.h2,content,this.section,this.buttonDelete, this.buttonEdit);
        workspace.append(this.div);
        addTopic(this.topic);
    }
}
// Each class handles a different type of card
class TextCard extends NoteCard {
    constructor(id,topic,summary,text,links){
        super(id,topic,summary,links);
        this.p = simpleElement("p","note-text",text);
    }
    displayCard() {super.displayCard(this.p)}
}
class ImageCard extends NoteCard {
    constructor(id,topic,summary,image,links){
        super(id,topic,summary,links);
        this.img = simpleElement("img","note-image");
        this.img.src = image;
        console.log(this.img);
    }
    displayCard() {super.displayCard(this.img)};
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
    console.log(event);
    let type;
    if (form.querySelector("#text-toggle").checked) {
        type = "text"
    } else if(form.querySelector("#image-toggle").checked) {
        type = "image"
    }
    fetch("http://localhost:3000/cards",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            topic: form.querySelector("#form-topic").value,
            type: type,
            summary: form.querySelector("#form-summary").value,
            content: form.querySelector("#form-content").value,
            links: formLinks
        })
    })
    .then(response => response.json())
    .then(card => {
        const newCard = makeTypedCard(card);
        newCard.displayCard(workspace);

        formLinks.length = 0;
        while (linksDisplay.firstChild) linksDisplay.removeChild(linksDisplay.firstChild);
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
    const a = simpleElement("a","",linkText.value)
    a.href = linkUrl.value;
    li.append(a);
    linksDisplay.append(li);

    linkText.value = "";
    linkUrl.value = "";
})
// Removes a link from the list
linkDiv.addEventListener("click",event=>{
    if(event.target.classList.contains("delete")){
        formLinks.pop();
        if(formLinks.length===0) {
            linkDiv.querySelector(".delete").disabled = true
        }
        linksDisplay.lastChild.remove();
    }
})
// Highlights a segment of text
document.addEventListener("keypress", event => {
    if(!event.target.classList.contains("restrict-key") && event.key === "h"){
        const selection = document.getSelection();
        // If you have only one element in your selection and it is the text in a .note-text
        if(selection.anchorNode === selection.focusNode && selection.anchorNode.parentNode.className === "note-text"){
            // Puts your selection in a span with class highlight
            const range = selection.getRangeAt(0);
            const span = simpleElement("span","highlight")
            range.surroundContents(span);
        }
    }
})
// Removes the clicked highlight, and manages both buttons
workspace.addEventListener("click",event =>{
    // First if is for clicking on highlighted text to remove it
    if(event.target.className==="highlight"){
        const textBox = event.target.parentNode;
        const text  = document.createTextNode(event.target.textContent);
        event.target.replaceWith(text);
        textBox.normalize();
    }
    // Second if is for the delete buttons on the cards
    else if(event.target.className === "delete-card"){
        console.log(event.target.parentNode.id);
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .catch(error => console.log(error))
        event.target.parentNode.remove();
    }
    // Third if is for the edit buttons on the cards
    else if(event.target.className === "edit-card"){
        const contentNode = event.target.parentNode.children[1];
        let textArea;
        if (contentNode.className === "note-text") {
            textArea = simpleElement("textArea","restrict-key edit-text",contentNode.textContent);
            textArea.style.height = `${Math.ceil(contentNode.clientHeight+20)}px`;
        }
        else if (contentNode.className === "note-image"){
            textArea = simpleElement("textArea","restrict-key edit-image",contentNode.src);
            textArea.style.height = `${Math.ceil(contentNode.clientHeight-10)}px`;
        }
        
        contentNode.replaceWith(textArea);

        event.target.textContent = "Submit"
        event.target.className = "edit-submit"
    }
    // Fourth is the sumbit edits button (only after you edit)
    else if(event.target.className === "edit-submit"){
        const textArea = event.target.parentNode.querySelector(".restrict-key");
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                content: textArea.value
            })
        })
        .then(resp => resp.json())
        .then(card => {
            if (card.type === "text") {
                const p = simpleElement("p","note-text",card.content);
                textArea.replaceWith(p);
            } else {
                const img = simpleElement("img","note-image");
                img.src = card.content
                textArea.replaceWith(img);
            }
            
            event.target.textContent = "Edit"
            event.target.className = "edit-card"
        })
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
.then(cards => cards.forEach(card => makeTypedCard(card).displayCard()))
.catch(error => console.log(error))