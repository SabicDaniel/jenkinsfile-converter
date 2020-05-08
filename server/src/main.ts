import { ExpressWrapper } from './ExpressWrapper';

import { VersionNumberResponder } from './responders/VersionNumberResponder';
import { JenkinsToCCIResponder } from './responders/JenkinsToCCIResponder';

class MainApp {
    public expWrapper = new ExpressWrapper();

    constructor() {
        this.armResponders();
    }

    public startListening() {
        return this.expWrapper
            .startListening()
            .catch(console.error.bind(console));
    }

    private armResponders() {
        this.expWrapper.armEndpoint(
            'GET',
            '/',
            VersionNumberResponder.getVersion
        );
        this.expWrapper.armEndpoint(
            'POST',
            '/to-config-yml',
            JenkinsToCCIResponder.convertJenkinsfileToConfigYml
        );
        this.expWrapper.armEndpoint(
            'POST',
            '/to-json',
            JenkinsToCCIResponder.convertJenkinsfileToJSON
        );
    }
}

const mainPromise: Promise<
    ExpressWrapper['httpServers']
> = new MainApp().startListening().catch(console.error.bind(console));

export { mainPromise };