import {
  Tooltip,
  IconButton,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
  Flex,
} from "@chakra-ui/react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Logo from "../assets/Logo.svg";

const MAX_MENTOR_COST = 500;

interface FilterDialogProps {
  onSave: (v: FilterValues) => void;
  minCost?: string;
  maxCost?: string;
}

export interface FilterValues {
  min_cost: number;
  max_cost: number;
}

const FilterDialog = ({ onSave, minCost, maxCost }: FilterDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onClose = () => setIsOpen(false);
  const [minSliderTooltip, setMinSliderTooltip] = useState<any>("FREE");
  const [maxSliderTooltip, setMaxSliderTooltip] = useState<any>("💰💰💰💰💰");
  const [minCostValue, setMinCostValue] = useState<any>(
    minCost ? Number(minCost) : 0
  );
  const [maxCostValue, setMaxCostValue] = useState<any>(
    maxCost ? Number(maxCost) : MAX_MENTOR_COST
  );

  const handleSave = () => {
    onSave({ max_cost: maxCostValue, min_cost: minCostValue });
    onClose();
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const onCostSliderChange = (vals: number[]) => {
    vals.forEach((val, index) => {
      const setSliderTooltip =
        index === 0 ? setMinSliderTooltip : setMaxSliderTooltip;
      const setValue = index === 0 ? setMinCostValue : setMaxCostValue;
      setValue(val);
      const percentage = (val / MAX_MENTOR_COST) * 100;
      if (percentage === 0) {
        setSliderTooltip("Free");
      } else if (percentage <= 30) {
        setSliderTooltip("💰");
      } else if (percentage > 30 && percentage <= 50) {
        setSliderTooltip("💰💰");
      } else if (percentage > 50 && percentage <= 70) {
        setSliderTooltip("💰💰💰");
      } else if (percentage > 70 && percentage <= 90) {
        setSliderTooltip("💰💰💰💰");
      } else {
        setSliderTooltip("💰💰💰💰💰");
      }
    });
  };

  const onMinCostValueChange = (_: string, val: number) => {
    setMinCostValue(val);
  };
  const onMaxCostValueChange = (_: string, val: number) => {
    setMaxCostValue(val);
  };
  return (
    <>
      <Tooltip hasArrow label="Edit Filters">
        <IconButton
          icon={<FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>}
          aria-label={"Edit Filters"}
          onClick={() => setIsOpen(true)}
        ></IconButton>
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Monthly Cost ($)</FormLabel>
              <RangeSlider
                name="mentorCost"
                aria-label={["Cost Range Minimum", "Cost Range Maximum"]}
                onChange={onCostSliderChange}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                value={[minCostValue, maxCostValue]}
                max={MAX_MENTOR_COST}
              >
                <RangeSliderTrack bg="brand.200">
                  <RangeSliderFilledTrack bg="brand.900" />
                </RangeSliderTrack>
                <Tooltip
                  hasArrow
                  bg="brand.200"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={minSliderTooltip}
                >
                  <RangeSliderThumb boxSize={6} index={0}>
                    <img src={Logo} alt="Hoots Logo" />
                  </RangeSliderThumb>
                </Tooltip>
                <Tooltip
                  hasArrow
                  bg="brand.200"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={maxSliderTooltip}
                >
                  <RangeSliderThumb boxSize={6} index={1}>
                    <img src={Logo} alt="Hoots Logo" />
                  </RangeSliderThumb>
                </Tooltip>
              </RangeSlider>
            </FormControl>
            <Flex gap="2">
              <FormControl>
                <FormLabel fontSize={"xs"}>Minimum</FormLabel>
                <NumberInput
                  min={0}
                  value={minCostValue}
                  onChange={onMinCostValueChange}
                >
                  <NumberInputField placeholder="Minimum" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize={"xs"}>Maximum</FormLabel>
                <NumberInput
                  min={0}
                  value={maxCostValue}
                  onChange={onMaxCostValueChange}
                >
                  <NumberInputField placeholder="Maximum" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              background="brand.500"
              textColor="white"
              type="submit"
              _hover={{ backgroundColor: "brand.200" }}
              mr={3}
              onClick={handleSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FilterDialog;
