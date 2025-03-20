'use client'


import react from 'react';
import { Outlet } from "react-router-dom";
import { Topbar } from './Topbar'
import { Stack, useColorModeValue } from '@chakra-ui/react'



export const DashboardLayout = ({ children }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.800')

    return (
        <Stack dir="rtl" bgColor={bgColor} height="100vh">
            <Topbar/>
            <Stack padding="6">
                <Outlet />
            </Stack>
        </Stack>
    );
}
