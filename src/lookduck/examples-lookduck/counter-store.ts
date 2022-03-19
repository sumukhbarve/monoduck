import { useEffect, useState } from 'react'
import { observable, makeUseLookable } from '../index-lookduck'

// A piece of observable state, with the conventional `ob` prefix:
export const obCount = observable(0)

// An action that updates observable(s), with `act` prefix:
export const actIncrementCount = (): void => obCount.set(obCount.get() + 1)

export const useLookable = makeUseLookable(useState, useEffect)
