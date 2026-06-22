import { Scene } from 'phaser'
import { ThemeConfig } from '../theme/theme.ts'
import { OriginX, OriginY } from '../util/origin.ts'
import { StyledComponentFactory } from './factory.ts'

export class InsertContext extends StyledComponentFactory {
    constructor(scene: Scene, theme: ThemeConfig) {
        super({
            scene,
            theme,
            originX: OriginX.Center,
            originY: OriginY.Center,
        })
    }

    at(originX: OriginX, originY: OriginY): StyledComponentFactory {
        const key = `${originX}-${originY}`
        let factory = this._factories[key]
        if (!factory) {
            factory = new StyledComponentFactory({
                scene: this.scene,
                theme: this.theme,
                originX,
                originY,
            })
            factory.setContainer(this._container)
            this._factories[key] = factory
        }
        return factory
    }
    private readonly _factories: { [key: string]: StyledComponentFactory } = {}

    get center(): StyledComponentFactory {
        return this.at(OriginX.Center, OriginY.Center)
    }

    get left(): StyledComponentFactory {
        return this.at(OriginX.Left, OriginY.Center)
    }

    get top(): StyledComponentFactory {
        return this.at(OriginX.Center, OriginY.Top)
    }

    get topLeft(): StyledComponentFactory {
        return this.at(OriginX.Left, OriginY.Top)
    }

    get topRight(): StyledComponentFactory {
        return this.at(OriginX.Right, OriginY.Top)
    }

    get bottom(): StyledComponentFactory {
        return this.at(OriginX.Center, OriginY.Bottom)
    }

    get bottomRight(): StyledComponentFactory {
        return this.at(OriginX.Right, OriginY.Bottom)
    }
}
