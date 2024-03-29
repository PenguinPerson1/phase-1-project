const form = document.getElementById("form");
const linkDiv = document.getElementById("form-links");
const formLinks = [];
const linksDisplay = document.getElementById("links-display");
const topics = new Set();
topics.add("");
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
    constructor(id,topic,summary,links){
        this.topic = topic;

        this.div = simpleElement("div","note-card");
        if(this.topic !== "") this.div.classList.add(topic);
        this.div.id = id; 

        this.h2 = simpleElement("h2","note-summary",summary);
        this.section = simpleElement("section","note-links-list");
        
        this.buttonDelete = simpleElement("button","delete-card","Delete");
        this.buttonDelete.addEventListener("click",this.constructor.deleteButton);

        this.buttonEdit = simpleElement("button","edit-card","Edit");
        this.buttonEdit.addEventListener("click", this.constructor.editButton.bind(this), false);

        this.buttonSubmit = simpleElement("button","submit-card","Submit");
        this.buttonSubmit.addEventListener("click", this.constructor.submitButton.bind(this), false);

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
    // Makes a card based on what type it is
    static makeTypedCard(card){
        if (card.type === "text") {
            return new TextCard(card.id,card.topic,card.summary,card.content,card.links);
        } else if(card.type === "image") {
            return new ImageCard(card.id,card.topic,card.summary,card.content,card.links);
        }
    }
    // Deletes the card
    static deleteButton(event){
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .catch(error => console.log(error))
        event.target.parentNode.remove();
    }
    // Replaces the content with an editable textbox and the edit button with submit
    static editButton(event,content){
        content.replaceWith(this.textArea);
        this.buttonEdit.replaceWith(this.buttonSubmit);
    }
    // Submits the changes and replaces the content & edit button back
    static submitButton(event,content,contentVal) {
        fetch(`http://localhost:3000/cards/${this.div.id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                content: this.textArea.value
            })
        })
        .then(resp => resp.json())
        .then(card => {
            content[contentVal] = card.content;
            this.textArea.replaceWith(content);
            this.buttonSubmit.replaceWith(this.buttonEdit);
        })
    }
}
// Each class handles a different type of card
class TextCard extends NoteCard {
    constructor(id,topic,summary,text,links){
        super(id,topic,summary,links);
        this.p = simpleElement("p","note-text",text);
        this.textArea = simpleElement("textArea","restrict-key edit-text",this.p.textContent);
    }
    displayCard() {super.displayCard(this.p)}
    static editButton(event) {
        this.textArea.style.height = `${Math.ceil(this.p.clientHeight+20)}px`;
        super.editButton(event,this.p);
    }
    static submitButton(event) {super.submitButton(event,this.p, "textContent")}
}
class ImageCard extends NoteCard {
    constructor(id,topic,summary,image,links){
        super(id,topic,summary,links);
        this.img = simpleElement("img","note-image");
        this.img.src = image;
        this.textArea = simpleElement("textArea","restrict-key edit-image",this.img.src);
    }
    displayCard() {super.displayCard(this.img);};
    static editButton(event) {
        this.textArea.style.height = `${Math.ceil(this.img.clientHeight-10)}px`;
        super.editButton(event,this.img)
    }
    static submitButton(event) {super.submitButton(event,this.img, "src")}
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
        type = "text";
    } else if(form.querySelector("#image-toggle").checked) {
        type = "image";
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
        const newCard = NoteCard.makeTypedCard(card);
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
    const linkUrl = linkDiv.querySelector("#link-url");
    formLinks.push([[linkText.value],[linkUrl.value]]);

    linkDiv.querySelector(".delete").disabled = false;
    
    const li = document.createElement("li");
    const a = simpleElement("a","",linkText.value);
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
        linkDiv.querySelector(".delete").disabled = formLinks.length===0;
        linksDisplay.lastChild.remove();
    }
})
// Highlights a segment of text
document.addEventListener("keypress", event => {
    if(event.key === "h"){
        const selection = document.getSelection();
        // If you have only one element in your selection and it is the text in a .note-text
        if(selection.anchorNode === selection.focusNode && selection.anchorNode.parentNode.className === "note-text"){
            // Puts your selection in a span with class highlight
            const range = selection.getRangeAt(0);
            const span = simpleElement("span","highlight");
            span.addEventListener("click",clickHighlight);
            range.surroundContents(span);
        }
    }
})
// Clicking on highlighted text to remove it (called on an Event Listener)
function clickHighlight(event) {
    const textBox = event.target.parentNode;
    const text  = document.createTextNode(event.target.textContent);
    event.target.replaceWith(text);
    textBox.normalize();
}
// Filters cards by topic
topicSelect.addEventListener("change", event=> {
    const filter = event.target.value;
    Array.from(workspace.querySelectorAll(".note-card")).forEach(element => {
        element.hidden = !(element.classList.contains(filter) || filter === "");
    });
})

// Gets cards on page load
fetch("http://localhost:3000/cards")
.then(response => response.json())
.then(cards => cards.forEach(card => NoteCard.makeTypedCard(card).displayCard()))
.catch(error => console.log(error))