export const backgrounds = ['aliceblue', 'antiquewhite', 'aquamarine', 'burlywood', 'cadetblue', 'coral', 'cornflowerblue', 'crimson',  'yellowgreen', 'darkkhaki', 'darkseagreen', 'deeppink', 'dodgerblue', 'lightblue', 'gold', 'lightcoral', 'orchid', 'palegreen', 'lavender', 'pink', 'powderblue', 'rebeccapurple' ]

const getRandomBackground = () => backgrounds[Math.floor(Math.random() * backgrounds.length)]

export const generateImageUrlWithRandomBackground = (imageUrl, width = 150, height = 150) => {
    const bgColor = getRandomBackground();
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      const img = new Image();
      img.crossOrigin = "anonymous"; // Prevent CORS issues
      img.src = imageUrl;

      img.onload = () => {
        // Fill the background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Resize & center the image
        const scale = Math.min((width * 0.8) / img.width, (height * 0.8) / img.height);
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        ctx.drawImage(img, (width - imgWidth) / 2, (height - imgHeight) / 2, imgWidth, imgHeight);

        // Convert to image URL
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject("Failed to load image");
    });
  };
