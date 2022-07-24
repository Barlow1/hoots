import { Avatar, Box, Grid, GridItem, 
    Text,
} from "@chakra-ui/react";

const Dashboard = () => {
    const userObject = {
        name: 'Jordan Peele',
        email: 'ThisIsARealEmail@JokesOnYou.com',
        industry: 'Engineering',
        mentorName: 'Ian Mckellen'
    }
    return (
        <Grid  gap={6}>
            <GridItem boxShadow='2xl' colSpan={12} w='100%' borderRadius='5'>
                <Box padding='5'>
                    <Grid gap={6}>
                        <GridItem colSpan={12}>
                            <Text fontSize='xl' fontWeight='bold'>
                                {userObject.name}
                            </Text>
                            <Text fontSize='sm'>
                                {userObject.email}
                            </Text>
                        </GridItem>
                        <GridItem colSpan={3}>
                            
                            <Text textColor='#9faec0' fontWeight='bold'>
                                Mentor
                            </Text>
                            <Box pt='2' display='flex'>
                            <Avatar
                            size={"sm"}
                            src={
                                "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                            }
                            />
                            <Text justifyContent='center' alignItems='center' display='flex' pl='2'fontSize='sm'>
                                {userObject.mentorName}
                            </Text>
                            </Box>
                        </GridItem>
                        <GridItem colSpan={3}>
                            <Text textColor='#9faec0' fontWeight='bold'>
                                Industry
                            </Text>
                            <Text pt='3' m='auto' fontSize='sm'>
                                {userObject.industry}
                            </Text>
                        </GridItem>
                    </Grid>
                </Box>    
            </GridItem>
            <GridItem w='100%' h='10' bg='gray' colSpan={4}/>
            <GridItem w='100%' h='10' bg='gray' colSpan={4} />
            <GridItem w='100%' h='10' bg='gray' colSpan={4} />


        </Grid>
    );
}

export default Dashboard;
