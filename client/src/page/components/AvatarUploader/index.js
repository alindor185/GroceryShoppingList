import React, { useRef } from "react";
import { Box, Image, Icon, Input } from "@chakra-ui/react";
import { FaCamera } from "react-icons/fa";


export const AvatarUploader = ({ avatar, setAvatar}) => {
    const fileInputRef = useRef(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Update avatar with uploaded image
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <Box position="relative" w="150px" h="150px" borderRadius="full" overflow="hidden" cursor="pointer" onClick={triggerFileInput}>
            {/* Avatar Image */}
            <Image
                src={avatar} alt="Avatar" w="100%" h="100%"
                objectFit="cover" borderRadius="full" border="1px" borderColor="gray.300"
            />

            {/* Camera Icon Overlay */}
            <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                bg="rgba(0, 0, 0, 0.5)"
                color="white"
                textAlign="center"
                p="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Icon as={FaCamera} boxSize={6} />
            </Box>

            {/* Hidden File Input */}
            <Input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
        </Box>
    );
};
