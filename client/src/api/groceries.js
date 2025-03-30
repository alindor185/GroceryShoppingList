import axios from "axios"
import { axiosInstance } from './axios';

export const GroceriesAPI = {

    searchGroceryByText: async (searchQuery) => {
        try {
            const { data } = await axiosInstance.get('/items/search?query=' + searchQuery)
            return data.items;
        }
        catch (error) {
            console.error("Error while fetching grocery items", error)
        }

    }
}
