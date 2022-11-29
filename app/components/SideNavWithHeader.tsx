import type { ReactNode, ReactText } from "react";
import React from "react";
import type { BoxProps, FlexProps } from "@chakra-ui/react";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import {
  BellIcon,
  ChevronDownIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faHome,
  faAward,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useFetcher } from "@remix-run/react";
// eslint-disable-next-line import/no-cycle
import { useMentorProfile, useUser } from "~/utils/useRootData";
import { routes } from "../routes";
import Logo from "../assets/Logo.svg";

interface LinkItemProps {
  name: string;
  icon: IconDefinition;
  link: string;
}
const LinkItems: Array<LinkItemProps> = [
  { name: "Dashboard", icon: faHome, link: routes.home },
  { name: "Browse", icon: faTableList, link: routes.browse },
  { name: "Goals", icon: faAward, link: routes.goals },
  /** TODO: Add back meet link when meet page is finished */
  // { name: "Meet", icon: faHandshake, link: routes.meet },
];

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("white", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: "6.5em" }} p="4">
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

function SidebarContent({ onClose, ...rest }: SidebarProps) {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: "6.5em" }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex
        h="20"
        alignItems="center"
        mx="5"
        justifyContent={{ base: "space-between", md: "center" }}
      >
        <Link
          to={routes.home}
          style={{ textDecoration: "none", display: "flex" }}
          onClick={onClose}
        >
          <img src={Logo} alt="Hoots Logo" />
        </Link>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          link={link.link}
          onClick={onClose}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
}

interface NavItemProps extends FlexProps {
  icon: IconDefinition;
  children: ReactText;
  link: string;
}
function NavItem({ icon, children, link, ...rest }: NavItemProps) {
  return (
    <Flex align="center" p="4" mx="4" {...rest}>
      <Tooltip
        label={children.toString()}
        hasArrow
        placement="right"
        display={{ base: "none", md: "block" }}
      >
        <Box>
          <Link to={link} style={{ textDecoration: "none", display: "flex" }}>
            <IconButton
              aria-label={children.toString()}
              icon={icon && <FontAwesomeIcon icon={icon} />}
              mr={{ base: ".3em", md: "0" }}
            />

            <Text my="auto" display={{ base: "flex", md: "none" }}>
              {children}
            </Text>
          </Link>
        </Box>
      </Tooltip>
    </Flex>
  );
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
function MobileNav({ onOpen, ...rest }: MobileProps) {
  const signOutFetcher = useFetcher();
  const user = useUser();
  const mentorProfile = useMentorProfile();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      ml={{ base: 0, md: "6.5em" }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<HamburgerIcon />}
      />
      <Box display={{ base: "flex", md: "none" }}>
        <Link to={routes.home} style={{ textDecoration: "none" }}>
          <img src={Logo} alt="Hoots Logo" />
        </Link>
      </Box>
      <HStack spacing={{ base: "0", md: "6" }}>
        <IconButton
          onClick={() => {
            toggleColorMode();
            window.location.reload();
          }}
          icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
          size="lg"
          variant="ghost"
          aria-label="toggle color mode"
        />
        {user && (
          <IconButton
            size="lg"
            variant="ghost"
            aria-label="notifications"
            icon={<BellIcon />}
          />
        )}
        <Flex alignItems="center">
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                {user && <Avatar size="sm" src={user.img ?? undefined} />}
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  {user ? (
                    <>
                      <Text fontSize="sm">{`${user.firstName} ${user.lastName}`}</Text>
                      <Text fontSize="xs" color="gray.600">
                        User
                      </Text>
                    </>
                  ) : (
                    <Text fontSize="sm">Get Started</Text>
                  )}
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <ChevronDownIcon />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              {user ? (
                <>
                  <Link to={routes.startAbout}>
                    <MenuItem>About Me</MenuItem>
                  </Link>
                  <MenuDivider />
                  <Link to={routes.newMentorProfile}>
                    <MenuItem>
                      {mentorProfile
                        ? "Edit Mentor Profile"
                        : "Create Mentor Profile"}
                    </MenuItem>
                  </Link>
                  <MenuDivider />
                  <MenuItem
                    onClick={() =>
                      signOutFetcher.submit(
                        {},
                        {
                          action: "actions/logout",
                          method: "post",
                        }
                      )
                    }
                  >
                    Sign out
                  </MenuItem>
                </>
              ) : (
                <>
                  <Link to={routes.login}>
                    <MenuItem>Sign In</MenuItem>
                  </Link>
                  <MenuDivider />
                  <Link to={routes.signup}>
                    <MenuItem>Create Account</MenuItem>
                  </Link>
                </>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
}
