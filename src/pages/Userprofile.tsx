import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Heading,
  Stack,
  Button,
  Input,
  Divider,
  Badge,
  Card,
  CardBody,
  HStack,
  Icon,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";


import { useSelector } from "react-redux";
import { MdEmail, MdPhone, MdPerson, MdVerifiedUser, MdLocationOn, MdCellTower, MdApartment, MdBadge } from "react-icons/md";
import { colors } from "../theme/colors";
import axios from "axios";
import { useCookies } from "react-cookie";



const UserProfile: React.FC = () => {
  const data = useSelector((state: any) => state?.auth);
  const [cookies] = useCookies();


  // Local state for editable fields
  const [first_name, setFirstName] = useState(data?.first_name || "");
  const [last_name, setLastName] = useState(data?.last_name || "");
  const [cpny_name, setcompanyName] = useState(data?.cpny_name || "");
  const [phone, setPhone] = useState(data?.phone || "");
  const [address, setAddress] = useState(data?.address || "");
  const [GSTIN, setGSTIN] = useState(data?.GSTIN || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankName, setBankName] = useState(data?.Bank_Name || "");
  const [accountNo, setAccountNo] = useState(data?.Account_No || "");
  const [ifscCode, setIFSCCode] = useState(data?.IFSC_Code || "");


  const toast = useToast();

  const handleUpdate = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "";
      const res = await axios.patch(
        `${baseURL}auth/user/profile`,
        {
          first_name: first_name,
          last_name: last_name,
          phone,
          address,
          cpny_name,
          GSTIN,
          Bank_Name: bankName,
          Account_No: accountNo,
          IFSC_Code: ifscCode,

        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      if (res.data.success) {
        toast({ title: "Profile updated successfully!", status: "success", duration: 3000, isClosable: true });
        await fetchUserProfile();
      } else {
        toast({
          title: res.data.message || "Failed to update profile",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || "Something went wrong while updating.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const fetchUserProfile = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "";
      const res = await axios.get(`${baseURL}auth/user`, {
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const user = res.data.user; // adjust if structure is different
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setcompanyName(user.cpny_name || "");
      setGSTIN(user.GSTIN || "");
      setBankName(user.Bank_Name || "");
      setAccountNo(user.Account_No || "");
      setIFSCCode(user.IFSC_Code || "");

    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [])
  return (
    <Box style={{ backgroundColor: colors.background.page }} className="flex justify-center items-center">
      <Box w="full" maxW="6xl" mx="auto">
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start" justify="center">
          <Card
            w="full"
            maxW={{ base: "100%", md: "500px", lg: "450px" }}
            mx="auto"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
              boxShadow: colors.shadow.sm,
            }}
          >
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Flex direction="column" align="center" py={4}>
                  <Avatar
                    size="xl"
                    name={`${data.firstname} ${data.lastname}`}
                    src={data.avatarUrl}
                    mb={4}
                    style={{ border: `4px solid ${colors.primary[100]}` }}
                  />
                  <Heading size={{ base: "md", md: "lg" }} style={{ color: colors.text.primary }} textAlign="center">
                    {data.firstname} {data.lastname}
                  </Heading>
                  <HStack mt={2} spacing={3} flexWrap="wrap" justify="center">
                    <Badge
                      variant="subtle"
                      style={{
                        backgroundColor: data.isVerified ? colors.success[100] : colors.warning[100],
                        color: data.isVerified ? colors.success[700] : colors.warning[700],
                      }}
                    >
                      <Icon as={MdVerifiedUser} mr={1} />
                      {data.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {data.role && (
                      <Badge
                        variant="subtle"
                        style={{
                          backgroundColor: colors.primary[100],
                          color: colors.primary[700],
                        }}
                      >
                        {data.role}
                      </Badge>
                    )}
                  </HStack>
                </Flex>

                <Divider style={{ borderColor: colors.border.light }} />

                <Stack spacing={5}>
                  {/* First Name */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPerson} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        First Name
                      </Text>
                    </HStack>
                    <Input
                      value={first_name}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </Box>
                  {/* Last Name */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPerson} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Last Name
                      </Text>
                    </HStack>
                    <Input
                      value={last_name}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </Box>
                  {/* Email */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdEmail} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Email
                      </Text>
                    </HStack>
                    <Input value={data.email || ""} isReadOnly />
                  </Box>

                  {/* Phone (Editable) */}

                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPhone} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Phone Number
                      </Text>
                    </HStack>
                    <Input
                      value={phone}
                      onChange={(e) => {
                        const input = e.target.value;
                        // Allow only numbers and max 10 characters
                        if (/^\d{0,10}$/.test(input)) {
                          setPhone(input);
                        }
                      }}
                      placeholder="Enter phone number"
                    />
                  </Box>

                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdApartment} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Company Name
                      </Text>
                    </HStack>
                    <Input
                      value={cpny_name}
                      onChange={(e) => setcompanyName(e.target.value)}
                      placeholder="Enter Company Name"
                    />
                  </Box>

                  {/* Address (New Field) */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdLocationOn} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Company Address
                      </Text>
                    </HStack>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter Company address"
                    />
                  </Box>


                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdBadge} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        GSTIN
                      </Text>
                    </HStack>
                    <Input
                      value={GSTIN}
                      onChange={(e) => {
                        const input = e.target.value;

                        if (/^[a-zA-Z0-9]{0,15}$/.test(input)) {
                          setGSTIN(input);
                        }
                      }}
                      // onChange={(e) => setGSTIN(e.target.value)}
                      placeholder="Enter GSTIN"
                    />
                  </Box>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      backgroundColor: colors.button.secondary,
                      color: colors.text.inverse,
                      marginTop: "10px",
                      
                    }}
                    size="sm"
                  >
                    {bankName || accountNo || ifscCode ? "Edit Bank Details" : "Add Bank Details"}
                  </Button>

                </Stack>
                <Divider style={{ borderColor: colors.border.light }} />
                {/* Update Button */}
                <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={2}>
                  <Button
                    flex="1"
                    onClick={handleUpdate}
                    style={{
                      backgroundColor: colors.button.primary,
                      color: colors.text.inverse,
                      padding: "12px 24px",
                    }}
                    _hover={{ backgroundColor: colors.button.primaryHover }}
                  >
                    Update profile
                  </Button>
                </Stack>
              </VStack>
            </CardBody>
          </Card>

        </Flex>
      </Box>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bank Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Bank Name</FormLabel>
              <Input
                placeholder="Enter Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Account Number</FormLabel>
              <Input
                placeholder="Enter Account Number"
                value={accountNo}
                onChange={(e) => {
                  const input = e.target.value;
                  if (/^\d{0,18}$/.test(input)) {
                    setAccountNo(input);
                  }
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>IFSC Code</FormLabel>
              <Input
                placeholder="Enter IFSC Code"
                value={ifscCode}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();
                  if (/^[A-Z0-9]{0,11}$/.test(input)) {
                    setIFSCCode(input);
                  }
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setIsModalOpen(false)}>
              Save
            </Button>
            <Button onClick={() => {
              setBankName("");
              setAccountNo("");
              setIFSCCode("");
              setIsModalOpen(false);
            }}>Clear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>

  );
};

export default UserProfile; 
