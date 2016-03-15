package demo

import "fmt"

type Edge struct {
	Weight int
	Start  *Node
	End    *Node
}
type Edge struct {
	Weight int
	Start  *Node
	End    *Node
}
type Edge struct {
	Weight int
	Start  *Node
	End    *Node
}
type Node struct {
	Value float32
}
type Graph struct {
	Nodes []*Node
	Edges []Edge
}

func main() {
	fmt.Println("test")
}