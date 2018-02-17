import { Resolver, Query } from '@nestjs/graphql'

@Resolver('Hello')
export class HelloResolver {
    @Query()
    hello(root, args, ctx, info) {
        return {
            msg: 'Hello world',
        }
    }
}
