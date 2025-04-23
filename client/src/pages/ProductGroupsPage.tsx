import Product from '@/components/Product'
import { Checkbox, Grid, GridItem, HStack, Stack, VStack } from '@chakra-ui/react'
import React from 'react'

function ProductGroupsPage() {
    return (
        <div>
            {/* the filter part */}
            <b>Filters</b>
            <HStack gap={7} m={4}>
                <Stack align="flex-start"  key={"solid"}>

                    <Checkbox.Root defaultChecked variant={"solid"}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>discount</Checkbox.Label>
                    </Checkbox.Root>
                </Stack>
                <Stack align="flex-start"  key={"solid"}>

                    <Checkbox.Root defaultChecked variant={"solid"}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>organic</Checkbox.Label>
                    </Checkbox.Root>
                </Stack>
                <Stack align="flex-start"  key={"solid"}>

                    <Checkbox.Root defaultChecked variant={"solid"}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>vegan</Checkbox.Label>
                    </Checkbox.Root>
                </Stack>
            </HStack>


            {/* the content part */}
            <Grid templateColumns="repeat(3, 1fr)" gap="6">
                <GridItem>
                <Product />
                </GridItem>
                <GridItem>
                <Product />
                </GridItem>
                <GridItem>
                <Product />
                </GridItem>
                <GridItem>
                <Product />
                </GridItem>
                <GridItem>
                <Product />
                </GridItem>
            </Grid>

        </div>
    )
}

export default ProductGroupsPage