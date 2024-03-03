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
  
        const selectedCategory = getCategoryFromURL() || getRandomCategory(data.cuentos);
        const categoriaData = data.cuentos.find((cuento) => cuento.categoria === selectedCategory);
  
        if (!categoriaData) {
          throw new Error(`No se encontraron datos para la categoría: ${selectedCategory}`);
        }
  
        const tiposSecciones = categoriaData.tipos;
  
        const seccionesAleatorias = tiposSecciones.map((tipo) => {
          const seccionAleatoria = categoriaData.cuentos
            .map((cuento, cuentoIndex) => ({
              categoria: categoriaData.categoria,
              cuentoIndex,
              tipo,
              seccion: cuento.secciones[tipo][0],
            }))
            .flat()
            .sort(() => 0.5 - Math.random())
            .slice(0, 1);
  
          return seccionAleatoria[0];
        });
  
        console.log('Datos cargados exitosamente');
        storySections = seccionesAleatorias.map((seccion) => ({
          ...seccion,
          visible: false,
        }));
  
        console.log('Story Sections:', seccionesAleatorias);
  
        renderStory();
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
        const indices = sections.map((s) => `${s.tipo}-${s.cuentoIndex +1}`);
        const uniqueId = indices.join('');
        
        // Convertir la cadena a un número
        const numericId = parseInt(uniqueId.replace(/\D/g, ''), 10);
      
        // Asegurarse de que sea un número largo
        const paddedNumericId = numericId * 10;
       
        const generatedId = `${categoria}-${paddedNumericId}`;
        console.log('Generated ID:', generatedId); // Agrega este console.log
        return generatedId;
      };
      
    /*const generateUniqueId = (categoria, sections) => {
      const indices = sections.map((s) => `${s.tipo}-${s.cuentoIndex}`);
      return `${categoria}-${indices.join('-')}`;
    };
  */
    goBackButton.addEventListener("click", () => {
      window.history.back();
    });
  
    reloadButton.addEventListener("click", fetchData);
  
    
  // Nueva función para cargar un cuento por ID
  const loadStoryById = (storyId) => {
    const [categoria, ...numericIdParts] = storyId.split('-');
    const numericId = parseInt(numericIdParts.join(''), 10);

    const selectedCategory = getCategoryFromURL() || categoria;
    const categoriaData = data.cuentos.find((cuento) => cuento.categoria === selectedCategory);

    if (!categoriaData) {
      console.error(`No se encontraron datos para la categoría: ${selectedCategory}`);
      return;
    }

    const selectedSection = findSectionById(categoriaData, numericId);

    if (!selectedSection) {
      console.error(`No se encontró un cuento con el ID: ${storyId}`);
      return;
    }

    storySections = [selectedSection];

    renderStory();
  };

  // Nueva función para buscar una sección por ID numérico
  const findSectionById = (categoriaData, numericId) => {
    for (const tipo of categoriaData.tipos) {
      for (const [cuentoIndex, cuento] of categoriaData.cuentos.entries()) {
        for (const [seccionIndex, seccion] of cuento.secciones[tipo].entries()) {
          const currentId = generateUniqueId(categoriaData.categoria, [{
            tipo,
            cuentoIndex,
          }]);
          const [currentCategoria, ...currentNumericIdParts] = currentId.split('-');
          const currentNumericId = parseInt(currentNumericIdParts.join(''), 10);

          if (currentNumericId === numericId) {
            return {
              categoria: categoriaData.categoria,
              cuentoIndex,
              tipo,
              seccion: cuento.secciones[tipo][seccionIndex],
              visible: false,
            };
          }
        }
      }
    }
    return null;
  };

  // Nueva función para manejar la búsqueda desde la barra
  const handleSearch = () => {
    const searchInput = document.getElementById("search-input");
    const storyId = searchInput.value.trim();

    if (storyId) {
      loadStoryById(storyId);
    }
  };

  // Crear elementos para la barra de búsqueda
  const searchBarContainer = document.createElement("div");
  searchBarContainer.classList.add("search-bar-container");

  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Buscar por ID");
  searchInput.setAttribute("id", "search-input");

  const searchButton = document.createElement("button");
  searchButton.textContent = "Buscar";
  searchButton.addEventListener("click", handleSearch);

  searchBarContainer.appendChild(searchInput);
  searchBarContainer.appendChild(searchButton);

  // Insertar la barra de búsqueda en el documento
  document.body.insertBefore(searchBarContainer, document.body.firstChild);

  // ... (Resto de tu código)
    fetchData();
  });
  