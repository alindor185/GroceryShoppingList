import axios from "axios"

const API_URL = "https://www.shufersal.co.il/online/he";
const DEPARTMENT = `departments:A` // the supermarket department

export const GroceriesAPI = {

    searchGroceryByText: async (searchQuery) => {
        try {

            const { data } =await axios.get(`${API_URL}/search/results?q=${searchQuery}:relevance:${DEPARTMENT}&limit=10`)
            // const items = data.results.filter((item)=> !UNSUPPORTED_CATEGORIES.includes(item.secondLevelCategory))
            const items = data.results;
            console.log("data", data)
            return items.splice(0, 5);
        }
        catch (error) {
            console.error("Error while fetching grocery items", error)
        }

    }
}
