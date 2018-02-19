import { Module, MiddlewaresConsumer, NestModule, RequestMethod } from '@nestjs/common'
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql'

import expressPlayground from 'graphql-playground-middleware-express'
import { graphqlExpress } from 'apollo-server-express'
import { importSchema } from 'graphql-import'

import { AppController } from './app.controller'

import { SubscriptionsModule } from './subscription/subscription.module'
import { HelloResolver } from './hello/hello.resolver'

@Module({
    imports: [SubscriptionsModule.forRoot(), GraphQLModule],
    controllers: [AppController],
    components: [HelloResolver],
})
export class ApplicationModule implements NestModule {
    constructor(
        private readonly subscriptionsModule: SubscriptionsModule,
        private readonly graphQLFactory: GraphQLFactory,
    ) {}

    configure(consumer: MiddlewaresConsumer) {
        const schema = this.createSchema()

        this.subscriptionsModule.createSubscriptionServer(schema)

        consumer
            .apply(
                expressPlayground({
                    endpoint: '/graphql',
                    subscriptionsEndpoint: process.env.SUBSCRIPTION_ENDPOINT,
                }),
            )
            .forRoutes({ path: '/playground', method: RequestMethod.GET })
            .apply(
                graphqlExpress(req => ({
                    schema,
                    // rootValue: { },
                    context: {
                        ...req,
                    },
                    tracing: true,
                })),
            )
            .forRoutes({ path: '/graphql', method: RequestMethod.ALL })
    }

    private createSchema() {
        const typeDefs = importSchema('./src/schema.graphql')

        const schema = this.graphQLFactory.createSchema({ typeDefs })
        return schema
    }
}
