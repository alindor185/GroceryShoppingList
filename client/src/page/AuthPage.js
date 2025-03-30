import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Checkbox,
  Link,
  HStack,
  IconButton,
  VStack,
  Divider,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { FaGoogle, FaFacebook, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion"; // ✅ Animation

export const AuthPage = ({ isRegister }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(!isRegister); // Control animation

  useEffect(() => {
    setIsLogin(!isRegister);
  }, [isRegister]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/users/login" : "/users/signup";
      const response = await fetch(`http://localhost:3031${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: isLogin ? "התחברות מוצלחת" : "הרשמה הצליחה",
          description: isLogin
            ? "ברוך הבא! אתה מחובר."
            : "נרשמת בהצלחה! ניתן להתחבר כעת.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(isLogin ? "/home" : "/login");
      } else {
        throw new Error(data.message || "פעולה נכשלה, נסה שוב.");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3031/auth/google";
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="green.50">
      <Box
        w="900px"
        h="500px"
        display="flex"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
        bg="white"
        position="relative"
      >
        {/* ✅ Animated Green Panel */}
        <motion.div
          initial={{ x: isLogin ? 0 : "100%" }}
          animate={{ x: isLogin ? 0 : "-100%" }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            background: "linear-gradient(to bottom right, green.300, green.500)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            zIndex: 1,
            borderRadius: "0 100px 100px 0",
          }}
        >
          <VStack spacing={4}>
            <Heading size="lg">{isLogin ? "חדש כאן?" : "כבר יש לך חשבון?"}</Heading>
            <Text fontSize="md">
              {isLogin
                ? "הצטרף עכשיו וגלו אפשרויות חדשות!"
                : "התחבר עכשיו לחשבון שלך!"}
            </Text>
            <Button
              colorScheme="whiteAlpha"
              variant="outline"
              borderRadius="full"
              _hover={{ bg: "white", color: "green.500" }}
              onClick={() => navigate(isLogin ? "/register" : "/login")}
            >
              {isLogin ? "הרשמה" : "כניסה"}
            </Button>
          </VStack>
        </motion.div>

        {/* ✅ Login/Register Form */}
        <Box flex="1" p={10} textAlign="center" zIndex={2}>
          <Heading mb={2} color="green.700">
            {isLogin ? "התחברות" : "הרשמה"}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {isLogin ? "התחבר באמצעות הרשתות החברתיות" : "הירשם באמצעות הרשתות"}
          </Text>

          <HStack spacing={4} justify="center" mt={4}>
            <IconButton icon={<FaFacebook />} aria-label="Facebook" variant="outline" colorScheme="facebook" size="lg" />
            <IconButton icon={<FaGoogle />} aria-label="Google" variant="outline" colorScheme="red" size="lg" onClick={handleGoogleLogin} />
            <IconButton icon={<FaLinkedin />} aria-label="LinkedIn" variant="outline" colorScheme="linkedin" size="lg" />
          </HStack>

          <Divider my={6} />

          <form onSubmit={handleSubmit}>
            <FormControl id="email" isRequired mb={4}>
              <Input type="email" name="email" value={credentials.email} onChange={handleChange} placeholder="כתובת מייל" bg="gray.100" borderRadius="full" _focus={{ bg: "white", borderColor: "green.500" }} />
            </FormControl>

            <FormControl id="password" isRequired mb={4}>
              <Input type="password" name="password" value={credentials.password} onChange={handleChange} placeholder="סיסמה" bg="gray.100" borderRadius="full" _focus={{ bg: "white", borderColor: "green.500" }} />
            </FormControl>

            {!isLogin && (
              <FormControl id="confirmPassword" isRequired mb={4}>
                <Input type="password" name="confirmPassword" placeholder="אימות סיסמה" bg="gray.100" borderRadius="full" _focus={{ bg: "white", borderColor: "green.500" }} />
              </FormControl>
            )}

            <HStack justify="space-between" alignItems="center" mb={4}>
              <Checkbox name="remember" colorScheme="green">{isLogin && "זכור אותי"}</Checkbox>
              {isLogin && (
                <Link onClick={() => navigate("/forgot-password")} color="green.500" fontSize="sm">
                  שכחת סיסמה?
                </Link>
              )}
            </HStack>

            <Button type="submit" width="full" isLoading={isLoading} mb={4} colorScheme="green" size="lg" borderRadius="full" _hover={{ bg: "green.600" }}>
              {isLogin ? "התחבר" : "הירשם"}
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};
