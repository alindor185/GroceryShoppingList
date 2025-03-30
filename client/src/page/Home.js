
import { Lists } from './components/Lists'
import { Flex, Spacer } from '@chakra-ui/react'

export const Home = () => {

    return (
        <Flex justifyContent="center" gap={6} flexWrap="wrap">
            <Lists/>
            <Lists isArchivedLists/>
        </Flex>
    )
}
