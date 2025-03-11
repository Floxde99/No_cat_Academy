const token = "f586eb8f-ecf5-4492-96cf-0698e003d3ad"
const urlBase = "http://146.59.242.125:3009/"
const addForm = document.querySelector('#addForm')

async function getPromos() {
   const response = await fetch(urlBase + "promos", {
    method:"GET",
    headers: {
        Authorization : "Bearer " + token
    }
   })
   const data = await response.json()
   console.log(data);
}


addForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    let data = {
        name : document.querySelector('#name').value,
        startDate : document.querySelector('#startDate').value,
        endDate: document.querySelector('#endDate').value,
        formationDescription : document.querySelector('#formationDescription').value,
    }
    data = JSON.stringify(data)
    const response = await fetch(urlBase + "promos", {
        method:"POST",
        headers: {
            Authorization : "Bearer " + token,
            "Content-type": "Application/json"
        },
        body: data
       })
       getPromos()
})

getPromos()

console.log("J'ai fini aussi");
