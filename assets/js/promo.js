const token = "f586eb8f-ecf5-4492-96cf-0698e003d3ad";
const urlBase = "http://146.59.242.125:3009/";
const addForm = document.querySelector("#promoForm");
const editForm = document.querySelector("#editForm");

async function getPromos() {
  const response = await fetch(urlBase + "promos", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
}

async function displayAllPromo() {
  const promos = await getPromos();
  promos.forEach((promo) => {
    ajouterPromo(
      promo.name,
      promo.formationDescription,
      promo.students?.length || 0,
      promo._id
    );
  });
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: document.querySelector("#name").value,
    startDate: document.querySelector("#startDate").value,
    endDate: document.querySelector("#endDate").value,
    formationDescription: document.querySelector("#formationDescription").value,
  };

  const response = await fetch(urlBase + "promos", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const newPromo = await response.json();
    ajouterPromo(
      newPromo.data.name,
      newPromo.data.formationDescription,
      newPromo.data.students?.length || 0,
      newPromo.data._id
    );
    closeModal("exampleModal");
    addForm.reset();
  }
});

function ajouterPromo(titre, description, nbEleves, id) {
    const newLi = document.createElement("li");
    newLi.className = "list-group-item d-flex flex-column w-75";
    newLi.id = `promo-${id}`;


    newLi.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto titre">
            <a href="./studentpage.html?promo=${id}" class="fw-bold">${titre}</a>
            <p class="w-75">${description}</p>
        </div>
        <span class="badge bg-primary rounded-pill">nb élèves : ${nbEleves}</span>
    </div>
    <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-warning btn-sm me-1" onclick="modifierPromo('${id}')" title="Modifier">
            <svg width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0zm-6.6 1.1L1.1 5.5v7.1l2.2-2.2 6.7-6.7-2.2-2.2zM11.8 9.5l.6.6 1.4-1.4-6.7-6.7-.6.6 6.7 6.7z"/>
            </svg>
        </button>
        <button class="btn btn-danger btn-sm" onclick="supprimerPromo('${id}')" title="Supprimer">
            <svg width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
        </button>
    </div>
`;


    document.getElementById("list").appendChild(newLi);
}

async function modifierPromo(id) {
  try {
    const promo = await fetchPromoById(id);

    document.getElementById("editName").value = promo.name;
    document.getElementById("editStartDate").value =
      promo.startDate.split("T")[0];
    document.getElementById("editEndDate").value = promo.endDate.split("T")[0];
    document.getElementById("editDescription").value =
      promo.formationDescription;

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();

    editForm.onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        name: document.getElementById("editName").value,
        startDate: document.getElementById("editStartDate").value,
        endDate: document.getElementById("editEndDate").value,
        formationDescription: document.getElementById("editDescription").value,
      };

      const response = await fetch(`${urlBase}promos/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const promoElement = document.getElementById(`promo-${id}`);
        promoElement.querySelector(".fw-bold").textContent = updatedData.name;
        promoElement.querySelector("p").textContent =
          updatedData.formationDescription;
        modal.hide();
      }
    };
  } catch (error) {
    console.error("Erreur modification:", error);
  }
}

async function supprimerPromo(id) {
  const response = await fetch(urlBase + "promos/" + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (response.ok) {
    document.getElementById(`promo-${id}`).remove();
  }
}

async function fetchPromoById(id) {
  const response = await fetch(urlBase + "promos/" + id, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
}

function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}

displayAllPromo();
