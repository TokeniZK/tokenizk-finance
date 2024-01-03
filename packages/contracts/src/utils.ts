import { BaseSiblingPath } from '@tokenizk/merkle-tree';
import {
  Bool,
  Field,
  Poseidon,
  PrivateKey,
  provablePure,
  Provable,
} from 'o1js';

export function separateHighPartFor254BitField(x: Field): {
  xDiv2Var: Field;
  isOddVar: Field;
} {
  let { xDiv2Var, isOddVar } = Provable.witness(
    provablePure({ xDiv2Var: Field, isOddVar: Field }),
    () => {
      let bits = x.toBits();
      Provable.log('bitlen: ', bits.length);
      let isOdd = bits.shift()!.toBoolean() ? 1n : 0n;

      return {
        xDiv2Var: Field.fromBits(bits),
        isOddVar: Field(isOdd),
      };
    }
  );

  xDiv2Var.mul(2).add(isOddVar).assertEquals(x);
  return {
    xDiv2Var,
    isOddVar,
  };
}

// Negative numbers are not supported. only support 254 bit field
export function greaterThanFor254BitField(x: Field, y: Field) {
  let { xDiv2Var: xHighPart, isOddVar: xParity } =
    separateHighPartFor254BitField(x);
  let { xDiv2Var: yHighPart, isOddVar: yParity } =
    separateHighPartFor254BitField(y);

  Provable.log(
    'greaterThanFor254BitField - xHighPart: ',
    xHighPart,
    ', xParity: ',
    xParity
  );
  Provable.log(
    'greaterThanFor254BitField - yHighPart: ',
    yHighPart,
    ', yParity: ',
    yParity
  );
  let highPartGreaterThan = xHighPart.greaterThan(yHighPart);
  let highPartEqual = xHighPart.equals(yHighPart);
  let parityGreaterThan = xParity.greaterThan(yParity);

  return highPartGreaterThan.or(highPartEqual.and(parityGreaterThan));
}

export function checkMembership(
  leaf: Field,
  leafIndex: Field,
  witness: BaseSiblingPath,
  root: Field
) {
  const calculatedRoot = witness.calculateRoot(leaf, leafIndex);
  return calculatedRoot.equals(root);
}

export function checkMembershipAndAssert(
  leaf: Field,
  leafIndex: Field,
  witness: BaseSiblingPath,
  root: Field,
  msg?: string
) {
  checkMembership(leaf, leafIndex, witness, root).assertTrue(msg);
}

export function calculateNoteNullifier(
  commitment: Field,
  priKey: PrivateKey,
  isRealNote: Bool
): Field {
  return Poseidon.hash([
    commitment,
    Poseidon.hash(priKey.toFields()),
    isRealNote.toField(),
  ]);
}

