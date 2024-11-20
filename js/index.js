const nameInput = document.querySelector("#name");
const dateIniInput = document.querySelector("#startDate");
const expDateInput = document.querySelector("#expDate");
const descriptionInput = document.querySelector("#description");
const costoInput = document.querySelector("#cost");

const form = document.querySelector("#form");
const tbody = document.querySelector("#listaAnuncios");
const btnSumit = document.querySelector("#btnSubmit");

const btnCancel = document.querySelector("#btnCancel");


let editingAd = null;

//inicializar el localstorage
let publicitys = getLocalStorage("publicity") || [];

function nameAlreadyExists(name) {
  let error;
  publicitys.forEach((row) => {
    if (row.name === name) {
      error = true;
    }
  });
  return error;
}

//funcion para almacenar una publicida
function saveNewPublicity(e) {
  e.preventDefault(); //evita recarga la pagina
  if (nameAlreadyExists(nameInput.value) && editingAd === null) {
    alert(`Ese nombre ${nameInput.value} de publicidad ya esta registrado`);
    return;
  }

  if (editingAd) {
    publicitys = publicitys.map((ad) =>
      ad.id === editingAd.id
        ? {
            ...ad,
            name: nameInput.value,
            dateIni: dateIniInput.value,
            expDate: expDateInput.value,
            description: descriptionInput.value,
            cost: costoInput.value,
          }
        : ad
    );
    persistLocalStorage("publicity", publicitys);
    updateTable(); // Refrescar tabla
    editingAd = null; // Resetear modo edición
    alert("Anuncio actualizado exitosamente!");
  } else {
    //formulario
    const newPubli = {
      id: Date.now(),
      name: nameInput.value,
      dateIni: dateIniInput.value,
      expDate: expDateInput.value,
      description: descriptionInput.value,
      cost: costoInput.value,
      active: false,
    };
    publicitys.push(newPubli);
    persistLocalStorage("publicity", publicitys); //guardar localStorage
    addRowToTable(newPubli); //agregar una fila para que se vea reactivo
    alert("Anuncio agregado exitosamente!");
  }
  form.reset(); //para limpiar formulario
  actionBtn();
}
//funcion que calcula los dias y tambien el total por dias
function calculateCostPerDay(startDate, expirationDate, cost) {
  const star = new Date(startDate);
  const end = new Date(expirationDate);
  // se convierten las fecha a date

  // Diferencia en milisegundos
  const diferenciaMs = end - star;
  // Convertir la diferencia a dias
  const days = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

  // Validar si hay días positivos
  if (days <= 0) {
    throw new Error(
      "La fecha de inicio debe ser anterior a la fecha de fin. error"
    );
  }

  // Calcular el costo por dia
  const total = cost * days;

  return { days, total };
}
const toggleCheckbox = (e, ad) => {
  publicitys = publicitys.map((row) =>
    row.name === ad.name ? { ...row, active: e.target.checked } : row
  );
  persistLocalStorage("publicity", publicitys);
};

const deletePubli = (ad, row) => {
  publicitys = publicitys.filter((i) => i.name !== ad.name);
  persistLocalStorage("publicity", publicitys);
  tbody.deleteRow(row.rowIndex - 1);
};
const editPubli = (ad) => {
  nameInput.value = ad.name;
  dateIniInput.value = ad.dateIni;
  expDateInput.value = ad.expDate;
  descriptionInput.value = ad.description;
  costoInput.value = ad.cost;
//
  editingAd = ad; //guarda el anuncio que se esta editando
  actionBtn();
};
function addRowToTable(ad) {
  //ad es  una publicidad
  const row = tbody.insertRow();
  row.insertCell().textContent = ad.name;
  row.insertCell().textContent = ad.description;
  row.insertCell().textContent = ad.dateIni;
  row.insertCell().textContent = ad.expDate;
  row.insertCell().textContent = calculateCostPerDay(
    ad.dateIni,
    ad.expDate,
    ad.cost
  ).days;
  row.insertCell().textContent = ad.cost;
  row.insertCell().textContent = calculateCostPerDay(
    ad.dateIni,
    ad.expDate,
    ad.cost
  ).total;

  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.checked = ad.active;

  row.insertCell().appendChild(checkbox);
  checkbox.addEventListener("change", (e) => toggleCheckbox(e, ad));

  const actionsCell = row.insertCell(); //fila de las acciones

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Eliminar";
  deleteButton.classList.add("btn-delete");
  const editButton = document.createElement("button");
  editButton.textContent = "Editar"; //se crea boton de editar en el dom para mostrarlo en la pagina 

  actionsCell.appendChild(editButton); // se agrega a la fila el boton de editar
  actionsCell.appendChild(deleteButton); // se agrega a la fila el boton de eliminar

  //eliminar fila
  deleteButton.addEventListener("click", () => deletePubli(ad, row));
  //editar fila
  editButton.addEventListener("click", () => editPubli(ad));
}
// Actualizar la tabla
function updateTable() {
  tbody.innerHTML = ""; // Limpiar la tabla
  publicitys.forEach(addRowToTable); // Volver a cargar las filas
}
form.addEventListener("submit", saveNewPublicity);

// Mostrar elementos guardados en localStorage al cargar la pagina
const loadList = () => {
  publicitys.forEach(addRowToTable);
};
//se llama la funcion
loadList();

const actionBtn = () =>{
 if(editingAd === null){
  btnSumit.textContent = "Registrar Anuncio";
  btnCancel.style.display = "none";
 }else{
  btnSumit.textContent = "Editar Anuncio";
  btnCancel.style.display = "inline-block";
 }
}
actionBtn();


btnCancel.addEventListener("click",()=>{
  form.reset()
  editingAd = null; // Resetear modo edicion
  actionBtn();
})