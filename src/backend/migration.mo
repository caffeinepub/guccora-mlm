import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldActor = { adminPrincipals : Map.Map<Principal, Bool> };
  type NewActor = {};

  public func run(old : OldActor) : NewActor {
    {};
  };
};
