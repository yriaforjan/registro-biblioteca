let libros = JSON.parse(localStorage.getItem("libros")) || [];

const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const h3 = document.querySelector("h3");
const exportBtn = document.getElementById("exportBtn");
const form = document.querySelector("form");
const lista = document.getElementById("bookList");
const fileInput = document.getElementById("importFile");
const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");

let editIndex = -1;

window.onload = () => {
    actualizarTabla(libros);
}

const esLibroDuplicado = (titulo, autor) => {
    return libros.some(libro => 
        libro.titulo.toLowerCase() === titulo.toLowerCase() && 
        libro.autor.toLowerCase() === autor.toLowerCase()
    );
}

const guardarLibro = () => {
    const titulo = document.getElementById("title").value.trim();
    const autor = document.getElementById("author").value.trim();
    const fechaPublicacion = document.getElementById("publicationYear").value.trim();
    const disponibilidadSelecionada = document.querySelector("input[name='availability']:checked");
    const disponibilidad = document.querySelector("label[for='"+disponibilidadSelecionada.id+"']").textContent;

    if (!titulo || !autor || !fechaPublicacion || !disponibilidadSelecionada) {
        alert("Por favor, completa todos los campos.");
        return;
    }else if(esLibroDuplicado(titulo, autor)){
        alert("Este libro ya existe en la biblioteca.");
        return;
    };

    const libro = {
        titulo,
        autor,
        fechaPublicacion,
        disponibilidad
    }

    libros.push(libro);
    localStorage.setItem("libros", JSON.stringify(libros));
    actualizarTabla(libros);
}

const actualizarTabla = (libros) => {
    lista.innerHTML = "";
    let index = 0;
    libros.forEach((libro)=>{
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="p-2 fst-italic align-middle">${libro.titulo}</td>
            <td class="p-2 align-middle">${libro.autor}</td>
            <td class="p-2 text-center align-middle">${libro.fechaPublicacion}</td>
            <td class="p-2 text-center align-middle">${libro.disponibilidad}</td>
            <td class="p-2 d-flex flex-column flex-md-row align-items-center justify-content-evenly text-center">
                <button id="editBtn" onclick="editarLibro(${index})" class="btn btn-sm btn-success mb-2 mb-md-0">Modificar</button>
                <button id="deleteBtn" onclick="eliminarLibro(${index})" class="btn btn-sm btn-danger">Eliminar</button>
            </td>
        `;
        lista.appendChild(fila);
        index++;
    })
};

const editarLibro = (index) => {
    const libro = libros[index];

    document.getElementById("title").value = libro.titulo;
    document.getElementById("author").value = libro.autor;
    document.getElementById("publicationYear").value = libro.fechaPublicacion;
    const radios = document.querySelectorAll("input[name='availability']");
    radios.forEach((radio) => {
        const label = document.querySelector("label[for='" + radio.id + "']");
        if (label && label.textContent.trim() === libro.disponibilidad.trim()) {
            radio.checked = true;
        }
    });

    h3.innerText = "Editar libro";
    saveBtn.style.display = "none";
    updateBtn.style.display = "block";

    editIndex = index;

    document.querySelector("form").scrollIntoView({ behavior: "smooth" });
};

const eliminarLibro = (index) => {
    libros.splice(index, 1);
    localStorage.setItem("libros", JSON.stringify(libros));
    actualizarTabla(libros);
    document.querySelector("form").scrollIntoView({ behavior: "smooth" });
};

const exportarDatos = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?><libros>';
    libros.forEach((libro)=>{
        xml += `
            <libro>
                <titulo>${libro.titulo}</titulo>
                <autor>${libro.autor}</autor>
                <fechaPublicacion>${libro.fechaPublicacion}</fechaPublicacion>
                <disponibilidad>${libro.disponibilidad}</disponibilidad>
            </libro>
        `;
    })
    xml += "</libros>";

    const blob = new Blob([xml], {type:"application/xml"});
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "registro_biblioteca.xml";
    anchor.click();
}

const searchBooks = (libros) => {
    const searchInput = document.getElementById("searchBar").value.trim().toLowerCase();

    const librosEncontrados = libros.filter((libro) => 
        libro.titulo.toLowerCase().includes(searchInput) || libro.autor.toLowerCase().includes(searchInput) || libro.fechaPublicacion.toLowerCase().includes(searchInput)
    );
    actualizarTabla(librosEncontrados);
};

saveBtn.addEventListener("click", (ev)=>{
    ev.preventDefault();
    guardarLibro();
    form.reset();
});

updateBtn.addEventListener("click", (ev)=>{
    ev.preventDefault();
    const titulo = document.getElementById("title").value.trim();
    const autor = document.getElementById("author").value.trim();
    const fechaPublicacion = document.getElementById("publicationYear").value.trim();
    const disponibilidadSeleccionada = document.querySelector("input[name='availability']:checked");
    const disponibilidad = document.querySelector("label[for='"+disponibilidadSeleccionada.id+"']").textContent;

    if (!titulo || !autor || !fechaPublicacion || !disponibilidadSeleccionada) {
        alert("Por favor, completa todos los campos.");
        return;
    }
    
    const libro = {
        titulo,
        autor,
        fechaPublicacion,
        disponibilidad
    }

    libros[editIndex] = libro;

    localStorage.setItem("libros", JSON.stringify(libros));
    form.reset();
    actualizarTabla(libros);

    h3.innerText = "Registrar nuevo libro";
    saveBtn.style.display = "block";
    updateBtn.style.display = "none";

    editIndex = -1;
});

exportBtn.addEventListener("click", exportarDatos);

fileInput.addEventListener("change", (ev) => {
    const file = ev.target.files[0];
    if(!file){
        alert("No se ha seleccionado ningún elemento.")
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
        const xmlString = e.target.result;
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "application/xml");
        const librosXML = xml.querySelectorAll("libro");
        let duplicadosCount = 0;
        let invalidBooks = false;

        librosXML.forEach((libroXML) => {
            const tituloXML = libroXML.querySelector("titulo");
            const autorXML = libroXML.querySelector("autor");
            const fechaPublicacionXML = libroXML.querySelector("fechaPublicacion");
            const disponibilidadXML = libroXML.querySelector("disponibilidad");

            const titulo = tituloXML ? tituloXML.textContent : "";
            const autor = autorXML ? autorXML.textContent : "";
            const fechaPublicacion = fechaPublicacionXML ? fechaPublicacionXML.textContent : "";
            const disponibilidad = disponibilidadXML ? disponibilidadXML.textContent : "";

            if (!titulo || !autor || !fechaPublicacion || !disponibilidad) {
                invalidBooks = true;
                return;
            }

            if(esLibroDuplicado(titulo, autor)){
                duplicadosCount++;
                return;
            };

            const libro = {
                titulo,
                autor,
                fechaPublicacion,
                disponibilidad
            };

            libros.push(libro);
        });

        let errorMessage = "";
        if (invalidBooks) {
            errorMessage += "Algunos libros tienen campos vacíos y no fueron importados.\n";
        }
        if (duplicadosCount>0) {
            errorMessage += `Se encontraron ${duplicadosCount} libros duplicados que no fueron importados.`;
        }
        
        if (errorMessage) {
            alert(errorMessage);
        }

        actualizarTabla(libros);
        localStorage.setItem("libros", JSON.stringify(libros));
        ev.target.value = "";
    }
});

searchBtn.addEventListener("click", ()=> searchBooks(libros));

searchBar.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
        searchBooks(libros);
    }
});

searchBar.addEventListener("input", (ev) => {
    if (ev.target.value.trim() === "") {
        searchBooks(libros);
    }
});