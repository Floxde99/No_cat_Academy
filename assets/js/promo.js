const token = "f586eb8f-ecf5-4492-96cf-0698e003d3ad";
const urlBase = "http://146.59.242.125:3009/";
const addForm = document.querySelector("#promoForm");

async function getPromos() {
  const response = await fetch(urlBase + "promos", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data;
}

async function displayAllPromo() {
  const promos = await getPromos();
  promos.forEach((promo) => {
    ajouterPromo(
      promo.name,
      promo.formationDescription,
      promo.students.length,
      promo._id
    );
  });
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let data = {
    name: document.querySelector("#name").value,
    startDate: document.querySelector("#startDate").value,
    endDate: document.querySelector("#endDate").value,
    formationDescription: document.querySelector("#formationDescription").value,
  };

  const response = await fetch(urlBase + "promos", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    const newPromo = await response.json();
    ajouterPromo(
      newPromo.name,
      newPromo.formationDescription,
      newPromo.students.length,
      newPromo._id
    );
    closeModal();
  }
});

// console.log("J'ai fini aussi");

// Fonction pour ajouter un nouvel élément à la liste
function ajouterPromo(titre, description, nbEleves, id) {
  // Créer un nouvel élément <li>
  const newLi = document.createElement("li");
  newLi.className = "list-group-item d-flex flex-column w-75";
  newLi.id = `promo-${id}`; // Ajouter un identifiant unique

  // Créer la structure interne de l'élément <li>
  const divContent = document.createElement("div");
  divContent.className = "d-flex justify-content-between align-items-start";

  const divText = document.createElement("div");
  divText.className = "ms-2 me-auto";

  const divTitle = document.createElement("div");
  divTitle.className = "fw-bold";
  divTitle.textContent = titre;

  const divDescription = document.createElement("p");
  divDescription.className = "w-75";
  divDescription.textContent = description;

  const spanBadge = document.createElement("span");
  spanBadge.className = "badge bg-primary rounded-pill";
  spanBadge.textContent = `nb élèves : ${nbEleves}`;

  // Créer les boutons
  const divButtons = document.createElement("div");
  divButtons.className = "d-flex justify-content-end mt-2";

  const btnEdit = document.createElement("button");
  btnEdit.className = "btn btn-warning btn-sm me-1";
  btnEdit.title = "Modifier";
  btnEdit.innerHTML = `
        <svg width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0zm-6.6 1.1L1.1 5.5v7.1l2.2-2.2 6.7-6.7-2.2-2.2zM11.8 9.5l.6.6 1.4-1.4-6.7-6.7-.6.6 6.7 6.7z"/>
        </svg>
    `;
  btnEdit.addEventListener("click", () => modifierPromo(id));

  const btnDelete = document.createElement("button");
  btnDelete.className = "btn btn-danger btn-sm";
  btnDelete.title = "Supprimer";
  btnDelete.innerHTML = `
        <svg width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
    `;
  btnDelete.addEventListener("click", () => supprimerPromo(id));

  // Assembler les éléments
  divText.appendChild(divTitle);
  divText.appendChild(divDescription);
  divContent.appendChild(divText);
  divContent.appendChild(spanBadge);
  divButtons.appendChild(btnEdit);
  divButtons.appendChild(btnDelete);
  newLi.appendChild(divContent);
  newLi.appendChild(divButtons);

  // Ajouter le nouvel élément <li> à la liste
  document.getElementById("list").appendChild(newLi);
}
async function modifierPromo(id) {
    currentEditId = id;
    const promo = await fetchPromoById(id);

    document.getElementById('editName').value = promo.name;
    document.getElementById('editStartDate').value = promo.startDate.split('T')[0];
    document.getElementById('editEndDate').value = promo.endDate.split('T')[0];
    document.getElementById('editDescription').value = promo.formationDescription;

    new bootstrap.Modal(document.getElementById('editModal')).show();
}
  
async function supprimerPromo(id) {
  const response = await fetch(urlBase + "promos/" + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (response.ok) {
    // Supprimer l'élément de la liste
    const promoElement = document.getElementById(`promo-${id}`);
    promoElement.remove();
  }
}
async function fetchPromoById(id) {
  const response = await fetch(urlBase + "promos/" + id, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data;
}
function closeModal() {
  const modalElement = document.getElementById("exampleModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
let currentEditId = null;

editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const updatedData = {
        name: document.getElementById('editName').value,
        startDate: document.getElementById('editStartDate').value,
        endDate: document.getElementById('editEndDate').value,
        formationDescription: document.getElementById('editDescription').value
    };

    const response = await fetch(`${urlBase}promos/${currentEditId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        const promoElement = document.getElementById(`promo-${currentEditId}`);
        promoElement.querySelector('.fw-bold').textContent = updatedData.name;
        promoElement.querySelector('p').textContent = updatedData.formationDescription;
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        currentEditId = null;
    }
});

displayAllPromo();
