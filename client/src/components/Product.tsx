import React from 'react'
import { Avatar, Button, Card, HStack, Spacer } from "@chakra-ui/react"


function Product() {
    return (
        <Card.Root width="320px" variant={"outline"}>
            <Card.Body gap="1">
                <Avatar.Root size="lg" shape="rounded" width={200} height={200}>
                    <Avatar.Image src="https://picsum.photos/200/300" />
                    <Avatar.Fallback name="ProductName" />
                </Avatar.Root>
                <Card.Title mb="1">ProductName</Card.Title>
                <Card.Description>
                    This is the card body.
                </Card.Description>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
                <HStack>
                    <p>250 kr</p>
                    <Spacer width={100} />
                    <Button>add to cart</Button>
                </HStack>
            </Card.Footer>
        </Card.Root>
    )
}

export default Product