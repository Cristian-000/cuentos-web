document.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("story-container");
  const categoryHeading = document.getElementById("category-heading");
  const buttonContainer = document.getElementById("button-container");
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

  const renderStory = () => {
    clearStoryContainer();
    const currentCategory = getCategoryFromURL() || 'Aleatorio';
    categoryHeading.textContent = `Categoría ${currentCategory}`;

    storySections.forEach((seccion, index) => {
      const paragraph = createParagraph(seccion.seccion, seccion.visible);
      storyContainer.appendChild(paragraph);
    });

    const cuentoId = generateUniqueId(currentCategory, storySections);
    showCuentoId(cuentoId);
  };

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
        console.error(`No se encontraron secciones con el ID: ${storyId}`);
        return;
      }
  
      storySections = sections;
  
      renderStory();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
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
});
