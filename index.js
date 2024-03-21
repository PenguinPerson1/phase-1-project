const workspace = document.getElementById("workspace");
const form = document.getElementById("form");
const linkDiv = document.getElementById("form-link-div");
const formLinks =[];
const linksDisplay = document.getElementById("links-display");
const topics = new Set();
topics.add("")
const topicSelect = document.querySelector("#topic-select");

function simpleElement(type,className,text="") {
    const element = document.createElement(type);
    element.className = className;
    element.textContent = text;
    return element;
}
class NoteCard {
    constructor(id,topic,summary,content,links){
        console.log(topic);
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
    displayCard(location){
        this.aList.forEach(link => {
            this.section.append(link);
            this.section.append(document.createElement("br"));
        });
        this.div.append(this.h2,this.p,this.section,this.button);
        location.append(this.div);
        if(!topics.has(this.topic)){
            topics.add(this.topic);
            const option = document.createElement("option");
            option.value = this.topic;
            option.textContent = this.topic;
            topicSelect.append(option);
        }
    }
}

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

linkDiv.addEventListener("submit",event =>{
    event.preventDefault();
    formLinks.push([[linkDiv.querySelector("#link-text").value],[linkDiv.querySelector("#link-url").value]])
    if(formLinks.length>0){
        linkDiv.querySelector(".delete").disabled = false;
    }
    const li = document.createElement("li");
    const p0 = simpleElement("p","",formLinks[formLinks.length-1][0])
    const p1 = simpleElement("p","",formLinks[formLinks.length-1][1])
    li.append(p0,p1);
    linksDisplay.append(li);
    linkDiv.querySelector("#link-text").value="";
    linkDiv.querySelector("#link-url").value="";
})
linkDiv.addEventListener("click",event=>{
    if(event.target.className === "delete"){
        formLinks.pop();
        if(formLinks.length===0){
            linkDiv.querySelector(".delete").disabled = true;
        }
        linksDisplay.lastChild.remove();
    }
})

document.addEventListener("keypress", event => {
    if(event.target.className !== "restrict-key" && event.key === "h"){
        const selection = document.getSelection();
        if(selection.anchorNode === selection.focusNode){
            const range = selection.getRangeAt(0);
            const span = simpleElement("span","highlight",getSelection().toString())
            selection.deleteFromDocument()
            range.insertNode(span)
            console.log(range);
            console.log(getSelection().toString());
        }
    }
})
workspace.addEventListener("click",event =>{
    if(event.target.className==="highlight"){
        const p = event.target.parentNode;
        console.log(p.childNodes);
        const text = Array.from(p.childNodes).reduce((acc,element) => acc + element.textContent,"")
        event.target.remove();
        p.textContent = text;
    } else if(event.target.className === "delete-card"){
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


fetch("http://localhost:3000/cards")
.then(response => response.json())
.then(cards => {
    cards.forEach(card => {
        const newCard = new NoteCard(card.id,card.topic,card.summary,card.content,card.links);
        newCard.displayCard(workspace);
    });
})
.catch(error => console.log(error))