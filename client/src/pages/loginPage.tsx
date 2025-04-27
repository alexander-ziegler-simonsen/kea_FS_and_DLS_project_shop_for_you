import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text
} from "@chakra-ui/react"

import { Stack } from "@chakra-ui/layout"
import { FormControl, FormLabel } from "@chakra-ui/form-control"
import { Checkbox } from "@chakra-ui/checkbox"

const LoginPage = () => {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box borderWidth="1px" borderRadius="lg" boxShadow="lg" p={8} w="sm" bg="white">
        <Stack spacing={4}>
          <Heading size="md" textAlign="center">
            Sign in to your account
          </Heading>

          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input type="email" placeholder="email@example.com" />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Password" />
          </FormControl>

          <Stack direction="row" align="center">
            <Checkbox>Remember me</Checkbox>
          </Stack>

          <Button colorScheme="blue" width="full">
            Sign in
          </Button>

          <Stack spacing={1}>
            <Text fontSize="sm">
              New around here?{" "}
              <Link color="blue.500" href="#">
                Sign up
              </Link>
            </Text>
            <Text fontSize="sm">
              Forgot password?{" "}
              <Link color="blue.500" href="#">
                Click here
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default LoginPage

