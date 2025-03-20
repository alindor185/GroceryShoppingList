const availableColors = ["red", "blue", "green", "teal", "orange", "purple", "pink", "yellow", "cyan"];
const categoryColorMap = {}; // Store assigned colors

export const getCategoryColor = (category) => {
    if (!categoryColorMap[category]) {
      const nextColor = availableColors[Object.keys(categoryColorMap).length % availableColors.length];
      categoryColorMap[category] = nextColor; // Assign new color
    }
    return categoryColorMap[category]; // Return assigned color
  };

