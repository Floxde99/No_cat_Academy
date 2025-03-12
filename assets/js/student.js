const token = "f586eb8f-ecf5-4492-96cf-0698e003d3ad";
const urlBase = "http://146.59.242.125:3009/";
const studentForm = document.getElementById("studentForm");
const editStudentForm = document.getElementById("editStudentForm");
let currentPromoId = null;

// Récupérer l'ID de la promotion depuis l'URL
function getPromoIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('promo');
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', function() {
    currentPromoId = getPromoIdFromUrl();
    
    if (!currentPromoId) {
        alert("Aucune promotion sélectionnée!");
        window.location.href = "../pages/PromoPage.html";
        return;
    }
    
    document.getElementById('currentPromoId').value = currentPromoId;
    
    // Charger les détails de la promotion
    loadPromoDetails(currentPromoId);
    
    // Charger les élèves de cette promotion
    loadStudentsForPromo(currentPromoId);
    
    // Configurer les gestionnaires d'événements
    document.getElementById('addStudentBtn').addEventListener('click', function() {
        const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
        studentModal.show();
    });
    
    document.getElementById('backToPromosBtn').addEventListener('click', function() {
        window.location.href = "../pages/PromoPage.html";
    });
    
    // Formulaire d'ajout d'élève
    studentForm.addEventListener('submit', handleAddStudent);
    
    // Formulaire de modification d'élève
    editStudentForm.addEventListener('submit', handleEditStudent);
});

// Charger les détails de la promotion
async function loadPromoDetails(promoId) {
    try {
        const promo = await fetchPromoById(promoId);
        document.getElementById('promoName').textContent = promo.name;
        
        // Format des dates
        const startDate = new Date(promo.startDate).toLocaleDateString('fr-FR');
        const endDate = new Date(promo.endDate).toLocaleDateString('fr-FR');
        document.getElementById('promoDates').textContent = `${startDate} - ${endDate}`;
        
        // Nombre d'élèves
        const studentCount = promo.students?.length || 0;
        document.getElementById('promoStudentCount').textContent = `nombre d'élèves: ${studentCount}`;
        
        document.getElementById('promoDescription').textContent = promo.formationDescription;
    } catch (error) {
        console.error("Erreur lors du chargement des détails de la promotion:", error);
    }
}

// Charger les élèves d'une promotion
async function loadStudentsForPromo(promoId) {
    try {
        const studentListElement = document.querySelector('.student-list');
        studentListElement.innerHTML = '';

        const promo = await fetchPromoById(promoId);
        const students = promo.students || []; // Peut contenir soit des strings, soit des objets

        if (students.length === 0) {
            studentListElement.innerHTML = '<p>Aucun élève dans cette promotion</p>';
            return;
        }

        for (const studentRef of students) {
            // Vérifier si c'est un objet complet ou un simple ID
            if (typeof studentRef === 'object' && studentRef !== null) {
                // On suppose qu'il a la forme { _id, firstName, ... }
                addStudentToDOM(
                    studentRef.firstName,
                    studentRef.lastName,
                    studentRef.age,
                    studentRef.avatar,
                    studentRef._id
                );
            } else {
                // C'est un ID (string) => fetch l'étudiant
                const student = await fetchStudentById(studentRef);
                addStudentToDOM(
                    student.firstName,
                    student.lastName,
                    student.age,
                    student.avatar,
                    student._id
                );
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement des élèves:", error);
    }
}



// Ajouter un élève (gestionnaire du formulaire)
async function handleAddStudent(e) {
    e.preventDefault();
    
    // Créer un FormData à partir du formulaire
    const formData = new FormData(studentForm);
    
    try {
        const response = await fetch(urlBase + "students", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
                // Pas de "Content-Type" ici, le navigateur le gère automatiquement
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            const newStudentId = result.data._id;
            // Récupérer l'URL de l'avatar renvoyé par le serveur
            const avatarUrl = result.data.avatar || "";
            
            // Ajouter l'élève à la promotion
            await addStudentToPromo(currentPromoId, newStudentId);
            
            // Ajouter l'élève au DOM en utilisant les valeurs du FormData
            addStudentToDOM(
                formData.get("firstName"),
                formData.get("lastName"),
                parseInt(formData.get("age"), 10),
                avatarUrl,
                newStudentId
            );
            
            // Mettre à jour le nombre d'élèves
            loadPromoDetails(currentPromoId);
            
            // Fermer le modal et réinitialiser le formulaire
            const modal = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
            modal.hide();
            studentForm.reset();
            
            // Masquer l'aperçu de l'avatar si présent
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.style.display = 'none';
                preview.src = '';
            }
        } else {
            const error = await response.json();
            alert("Erreur lors de l'ajout de l'élève: " + (error.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'élève:", error);
        alert("Erreur lors de l'ajout de l'élève");
    }
}

// Ajouter un élève à une promotion
async function addStudentToPromo(promoId, studentId) {
    try {
        const promo = await fetchPromoById(promoId);
        const students = promo.students || [];
        
        // Vérifier si l'élève est déjà dans la promotion
        if (!students.includes(studentId)) {
            students.push(studentId);
            
            const response = await fetch(`${urlBase}promos/${promoId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ students }),
            });
            
            return response.ok;
        }
        return true;
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'élève à la promotion:", error);
        return false;
    }
}

// Ajouter un élève au DOM
function addStudentToDOM(firstName, lastName, age, avatar, id) {
    const studentList = document.querySelector('.student-list');
    
    const studentCard = document.createElement('div');
    studentCard.className = 'student-card';
    studentCard.id = `student-${id}`;
    
    // Calcul de la date de naissance approximative à partir de l'âge
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const dateNaissance = `01/01/${birthYear}`;
    
    studentCard.innerHTML = `
        <div class="student-left">
            <div class="photo-placeholder">
                <div class="photo-text">photo<br>chat</div>
            </div>
            <div class="student-info">
                <p>${firstName} ${lastName}</p>
                <p class="birth-date">date de naissance: ${dateNaissance}</p>
            </div>
        </div>
        <div class="action-buttons">
            <button class="edit-btn" onclick="openEditModal('${id}')"></button>
            <button class="delete-btn" onclick="deleteStudent('${id}')"></button>
        </div>
    `;
    
    studentList.appendChild(studentCard);
}

// Ouvrir le modal de modification d'un élève
async function openEditModal(studentId) {
    try {
        const student = await fetchStudentById(studentId);
        
        document.getElementById('editStudentId').value = student._id;
        document.getElementById('editFirstName').value = student.firstName;
        document.getElementById('editLastName').value = student.lastName;
        document.getElementById('editAge').value = student.age;
        document.getElementById('editAvatar').value = student.avatar || "";
        
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
    } catch (error) {
        console.error("Erreur lors de la récupération des données de l'élève:", error);
        alert("Erreur lors de la récupération des données de l'élève");
    }
}

// Modifier un élève (gestionnaire du formulaire)
async function handleEditStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('editStudentId').value;
    const data = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        age: parseInt(document.getElementById('editAge').value, 10),
        avatar: document.getElementById('editAvatar').value || "",
    };
    
    try {
        const response = await fetch(`${urlBase}students/${studentId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            // Mettre à jour l'élève dans le DOM
            updateStudentInDOM(studentId, data);
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
            modal.hide();
        } else {
            const error = await response.json();
            alert("Erreur lors de la modification de l'élève: " + (error.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("Erreur lors de la modification de l'élève:", error);
        alert("Erreur lors de la modification de l'élève");
    }
}

// Mettre à jour un élève dans le DOM
function updateStudentInDOM(studentId, data) {
    const studentCard = document.getElementById(`student-${studentId}`);
    if (!studentCard) return;
    
    // Calcul de la date de naissance approximative à partir de l'âge
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - data.age;
    const dateNaissance = `01/01/${birthYear}`;
    
    const studentInfo = studentCard.querySelector('.student-info');
    studentInfo.innerHTML = `
        <p>${data.firstName} ${data.lastName}</p>
        <p class="birth-date">date de naissance: ${dateNaissance}</p>
    `;
    
    // Mettre à jour la photo si nécessaire
    if (data.avatar) {
        const photoText = studentCard.querySelector('.photo-text');
        photoText.innerHTML = `<img src="${data.avatar}" alt="Photo" width="100%" height="100%">`;
    }
}

// Supprimer un élève
async function deleteStudent(studentId) {
    
    try {
        // Supprimer l'élève de la promotion
        const promo = await fetchPromoById(currentPromoId);
        const updatedStudents = promo.students.filter(id => id !== studentId);
        
        await fetch(`${urlBase}promos/${currentPromoId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ students: updatedStudents }),
        });
        
        // Supprimer l'élève de la base de données
        const response = await fetch(`${urlBase}students/${studentId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (response.ok) {
            // Supprimer l'élève du DOM
            document.getElementById(`student-${studentId}`).remove();
            
            // Mettre à jour le nombre d'élèves
            loadPromoDetails(currentPromoId);
        } else {
            const error = await response.json();
            alert("Erreur lors de la suppression de l'élève: " + (error.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de l'élève:", error);
        alert("Erreur lors de la suppression de l'élève");
    }
}

// Fonctions utilitaires pour les appels API
async function fetchPromoById(id) {
    const response = await fetch(`${urlBase}promos/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la promotion: ${response.status}`);
    }
    
    return await response.json();
}

async function fetchStudentById(id) {
    const response = await fetch(`${urlBase}students/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'élève: ${response.status}`);
    }
    
    return await response.json();
}

// Rendre les fonctions disponibles globalement pour les gestionnaires d'événements inline
window.openEditModal = openEditModal;
window.deleteStudent = deleteStudent;
