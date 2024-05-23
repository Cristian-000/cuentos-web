/*
Este script, ejecutado al cargarse completamente la página,
gestiona la interacción con un conjunto de cuentos almacenados en un archivo JSON.
La funcionalidad principal incluye la carga de datos de cuentos,
la selección de una categoría al azar o basada en la URL,
y la visualización de secciones aleatorias de los cuentos en el contenedor designado.
El script permite a los usuarios recargar secciones específicas y
generar un identificador único para el cuento visualizado.
También ofrece una barra de búsqueda para cargar cuentos específicos por su ID y una 
función de compartir que recopila el contenido del cuento y el ID para compartirlo usando la 
API de compartir del navegador. Se emplean botones para navegar hacia atrás, recargar el cuento y compartirlo, 
así como para cambiar secciones individualmente mediante eventos de clic que invocan funciones específicas.
*/
document.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("story-container");
  const categoryHeading = document.getElementById("category-heading");
  const buttonContainer = document.getElementById("button-section");
  const goBackButton = document.getElementById("go-back-button");
  const reloadButton = document.getElementById("reload-button");

  let storySections = [];
  let data;

  const fetchData = async () => {
    try {
      console.log('Iniciando fetchData');
      const response = await fetch(
        'https://raw.githubusercontent.com/Cristian-000/cuentos.json/main/cuentos.json'
      );
      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status}`);
      }
      data = await response.json();
  
      if (!data || !data.cuentos || !Array.isArray(data.cuentos)) {
        throw new Error('Los datos recibidos no tienen el formato esperado.');
      }
  
      const selectedCategory = getCategoryFromURL() || getRandomCategory(data.cuentos);
      const categoriaData = data.cuentos.find((cuento) => cuento.categoria === selectedCategory);
  
      if (!categoriaData) {
        throw new Error(`No se encontraron datos para la categoría: ${selectedCategory}`);
      }
  
      const seccionesAleatorias = [];
      for (const tipo of categoriaData.tipos) {
        const secciones = tipo.secciones || [];
        if (secciones.length > 0) {
          const seccionAleatoria = secciones[Math.floor(Math.random() * secciones.length)];
          seccionesAleatorias.push({
            categoria: categoriaData.categoria,
            tipo: tipo.tipo,
            seccion: seccionAleatoria.contenido,
            id: seccionAleatoria.id // Tomar el ID del JSON
          });
        }
      }
  
      console.log('Datos cargados exitosamente');
      storySections = seccionesAleatorias.map((seccion) => ({
        ...seccion,
        visible: false,
      }));
  
      console.log('Story Sections:', seccionesAleatorias);
  
      renderStory();
  
      const cuentoId = generateUniqueId(selectedCategory, seccionesAleatorias);
      showCuentoId(cuentoId); // Mostrar el ID generado
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };
  

  const getCategoryFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria');
  };

  const getRandomCategory = (categories) => {
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex].categoria;
  };


  /* */
  const createChangeSectionButton = (sectionId) => {
    const button = document.createElement("button");
    button.innerHTML = `<i class="fas fa-sync-alt"></i>`;
    button.classList.add("change-section-button");
    button.addEventListener("click", () => {
        changeSection(sectionId);
    });
    return button;
};



const renderStory = () => {
    clearStoryContainer();
    const currentCategory = getCategoryFromURL() || 'Aleatorio';
    categoryHeading.textContent = `Categoría ${currentCategory}`;
   
    buttonContainer.innerHTML = ""; // Limpiamos el contenedor de botones antes de agregar los nuevos
 
    storySections.forEach((seccion, index) => {
        const paragraph = createParagraph(seccion.seccion, seccion.visible);
        storyContainer.appendChild(paragraph);
        const changeSectionBtn = createChangeSectionButton(seccion.id); // Crear botón de cambio
        // Agregar el botón de cambio al contenedor
        buttonContainer.appendChild(changeSectionBtn);
           
    });

    const cuentoId = generateUniqueId(currentCategory, storySections);
    showCuentoId(cuentoId);
};


const changeSection = (sectionId) => {
  // Encontrar la sección actual en el array storySections
  const sectionToChangeIndex = storySections.findIndex(section => section.id === sectionId);
  if (sectionToChangeIndex !== -1) {
      // Sección encontrada
      
      // Seleccionar una nueva sección de la misma categoría y tipo
      const newSection = findRandomSectionOfSameCategoryAndType(storySections[sectionToChangeIndex].categoria, storySections[sectionToChangeIndex].tipo);
      if (newSection) {
          // Nueva sección encontrada
          
          // Reemplazar la sección antigua con la nueva
          storySections[sectionToChangeIndex] = newSection;
          
          // Renderizar el cuento actualizado
          renderStory();
          
          // Mostrar mensaje de éxito
          const successMessage = document.getElementById("success-message");
          successMessage.textContent = `Sección ${newSection.tipo} recargada.`;
          successMessage.style.display = "block";
          
          // Ocultar el mensaje después de unos segundos
          setTimeout(() => {
              successMessage.textContent = "";
              successMessage.style.display = "none";
          }, 3000); 
      } else {
          // No se encontró una nueva sección
          alert("No se encontró una nueva sección de la misma categoría y tipo.");
      }
  } else {
      // No se encontró la sección
      alert("No se encontró la sección con el ID especificado.");
  }
};

// Función para encontrar una sección aleatoria de la misma categoría y tipo
const findRandomSectionOfSameCategoryAndType = (categoria, tipo) => {
  const categoriaData = data.cuentos.find(cuento => cuento.categoria === categoria);
  if (categoriaData) {
      const tipoData = categoriaData.tipos.find(t => t.tipo === tipo);
      if (tipoData && tipoData.secciones.length > 0) {
          // Encontrar una sección aleatoria diferente a la actual
          let newSection;
          do {
              newSection = tipoData.secciones[Math.floor(Math.random() * tipoData.secciones.length)];
          } while (storySections.some(section => section.id === newSection.id));
          return {
              categoria: categoria,
              tipo: tipo,
              seccion: newSection.contenido,
              id: newSection.id,
              visible: false
          };
      }
  }
  return null;
};


  /* */
  const clearStoryContainer = () => {
    const paragraphs = document.querySelectorAll('.section-paragraph');
    paragraphs.forEach(paragraph => {
      paragraph.remove();
    });
  };

  const createParagraph = (text, isVisible) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    paragraph.classList.add("section-paragraph");
    if (isVisible) {
      paragraph.classList.add("visible");
    }
    return paragraph;
  };

  const showCuentoId = (cuentoId) => {
      // Elimina el mensaje anterior si existe
      const existingIdMessage = document.querySelector('.cuento-id-message');
      if (existingIdMessage) {
        existingIdMessage.remove();
      }
    
      const idMessage = document.createElement("p");
      idMessage.textContent = `ID del cuento: ${cuentoId}`;
      idMessage.classList.add("cuento-id-message");
      storyContainer.appendChild(idMessage);
    };

  const generateUniqueId = (categoria, sections) => {
    const ids = sections.map((s) => s.id);
    const uniqueId = ids.join('-');
    console.log('Generated ID:', `${categoria}-${uniqueId}`);
    return `${categoria}-${uniqueId}`;
  };

  goBackButton.addEventListener("click", () => {
    window.history.back();
  });

  reloadButton.addEventListener("click", fetchData);

  // Nueva función para manejar la búsqueda desde la barra
  const handleSearch = () => {
     resetSearchFeedback();
    const searchInput = document.getElementById("search-input");
    const storyId = searchInput.value.trim();

    if (storyId) {
      loadStoryById(storyId);
    }
  };

  const loadStoryById = async (storyId) => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Cristian-000/cuentos.json/main/cuentos.json'
      );
      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status}`);
      }
      const data = await response.json();
      
      const [categoria, ...ids] = storyId.split('-');
      const selectedCategory = getCategoryFromURL() || categoria;
      const categoriaData = data.cuentos.find((cuento) => cuento.categoria === selectedCategory);
  
      if (!categoriaData || !categoriaData.tipos) {
        console.error(`Los datos de la categoría no tienen el formato esperado.`);
        return;
      }
  
      const sections = findSectionsByIds(categoriaData, ids);
  
      if (!sections || sections.length === 0) {
        // Mostrar un mensaje en el elemento search-feedback si no se encuentran resultados
        const searchFeedback = document.getElementById('search-feedback');
        searchFeedback.textContent = `No hay coincidencias en ID: ${storyId}`;
        searchFeedback.style.display = 'block';

         // Ocultar el mensaje
      setTimeout(() => {
        searchFeedback.style.display = 'none';
      }, 2500);

        return;
      }
  
      storySections = sections;
  
      renderStory();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };
  
  // Función para restablecer el contenido y el estilo del elemento search-feedback
const resetSearchFeedback = () => {
  const searchFeedback = document.getElementById('search-feedback');
  searchFeedback.textContent = '';
  searchFeedback.style.display = 'none';
};
  const findSectionsByIds = (categoriaData, ids) => {
    const sections = [];
  
    for (const tipo of categoriaData.tipos) {
      for (const seccion of tipo.secciones) {
        if (ids.includes(seccion.id.toString())) {
          sections.push({
            categoria: categoriaData.categoria,
            tipo: tipo.tipo,
            seccion: seccion.contenido,
            id: seccion.id,
            visible: false,
          });
        }
      }
    }
  
    return sections;
  };
  
  // Agregar evento de clic al botón de búsqueda
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", handleSearch);

  fetchData();
  
  // Función para compartir el cuento en formato de texto
const shareStory = () => {
  // Recopilar el contenido del cuento
  const storyText = Array.from(storyContainer.querySelectorAll('.section-paragraph'))
                      .map(paragraph => paragraph.textContent)
                      .join('\n');

  // Obtener el ID del cuento
  const cuentoId = document.querySelector('.cuento-id-message').textContent;

  // Obtener el enlace de la página
  const pageURL = "https://cristian-000.github.io/cuentos-web/";

  // Construir el texto completo que se compartirá
  const shareText = `\n${storyText}\n\n\n${cuentoId}\nGenera y comparte más cuentos en: ${pageURL}`;

  // Verificar si el navegador admite la API de share
  if (navigator.share) {
      navigator.share({
          title: 'Compartir Cuento',
          text: shareText,
      })
      .then(() => console.log('Contenido compartido con éxito'))
      .catch((error) => console.error('Error al compartir contenido:', error));
  } else {
      // Si el navegador no admite la API de share, proporcionar una alternativa
      alert('Tu navegador no admite la función de compartir.');
  }
};
// Agregar evento de clic al botón de compartir
const shareButton = document.getElementById("share-button");
shareButton.addEventListener("click", shareStory);
});

/*
const setBackgroundImage = (category) => {
    const categoryFolder = category.toLowerCase().replace(/ /g, '_');
    const imagesPath = `img/${categoryFolder}/`;

    fetch(imagesPath)
        .then(response => response.text())
        .then(text => {
            // Parsear el HTML de la carpeta de imágenes
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(text, 'text/html');
            const imageLinks = Array.from(htmlDoc.querySelectorAll('a')).map(link => link.getAttribute('href'));
            
            // Filtrar solo los archivos de imagen
            const imageFiles = imageLinks.filter(link => /\.(jpg|jpeg|png|gif)$/i.test(link));

            if (imageFiles.length > 0) {
                // Seleccionar una imagen aleatoria
                const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
                const imageURL = `${imagesPath}${randomImage}`;

                // Establecer la imagen como fondo del contenedor de historias
                storyContainer.style.backgroundImage = `url('${imageURL}')`;
            }
        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });
};

// Llamar a la función para establecer la imagen de fondo
setBackgroundImage(currentCategory);
*/